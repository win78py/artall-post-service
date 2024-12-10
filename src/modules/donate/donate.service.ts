import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import moment from 'moment';
import * as CryptoJS from 'crypto-js';
import * as qs from 'qs';
import { Repository } from 'typeorm';
import { Donation } from 'entities/donation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Donation1Response,
  DonationResponse,
  DonationsResponse,
  GetDonationsRequest,
  PageMeta,
} from '../../common/interface/donation.interface';
import { Order } from 'common/enum/enum';

@Injectable()
export class DonateService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Donation)
    public readonly donationRepository: Repository<Donation>,
  ) {}

  async getDonation(params: GetDonationsRequest): Promise<DonationsResponse> {
    const donation = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.user', 'user') // Liên kết với bảng User
      .select(['donation', 'user.id', 'user.username'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('donation.createdAt', Order.DESC);
    if (params.postId) {
      donation.andWhere('donation.postId = :postId', {
        postId: params.postId,
      });
    }
    const [result, total] = await donation.getManyAndCount();
    const data: Donation1Response[] = result.map((donation) => ({
      id: donation.id,
      postId: donation.postId,
      userId: donation.userId,
      username: donation.user?.username || null,
      amount: donation.amount,
      createdAt: donation.createdAt ? donation.createdAt.toISOString() : null,
      createdBy: donation.createdBy || null,
      updatedAt: donation.updatedAt ? donation.updatedAt.toISOString() : null,
      updatedBy: donation.updatedBy || null,
      deletedAt: donation.deletedAt ? donation.deletedAt.toISOString() : null,
      deletedBy: donation.deletedBy || null,
    }));

    const meta: PageMeta = {
      page: params.page,
      take: params.take,
      itemCount: total,
      pageCount: Math.ceil(total / params.take),
      hasPreviousPage: params.page > 1,
      hasNextPage: params.page < Math.ceil(total / params.take),
    };

    return { data, meta, message: 'Success' };
  }

  async createPayment(body: any): Promise<DonationResponse> {
    const { amount, postId, userId } = body;

    // Kiểm tra số tiền hợp lệ
    if (!amount || amount <= 0) {
      throw new HttpException(
        'Invalid amount for donation',
        HttpStatus.BAD_REQUEST,
      );
    }

    const config = {
      app_id: this.configService.get<string>('ZALOPAY_APP_ID'),
      key1: this.configService.get<string>('ZALOPAY_KEY1'),
      key2: this.configService.get<string>('ZALOPAY_KEY2'),
      endpoint: this.configService.get<string>('ZALOPAY_ENDPOINT_CREATE'),
    };

    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`; // Định nghĩa trước để dùng trong embed_data

    const embed_data = {
      redirecturl: `${this.configService.get<string>(
        'ZALOPAY_REDIRC_URL',
      )}/zalo/status?app_trans_id=${app_trans_id}&userId=${userId}&postId=${postId}&amount=${amount}`,
    };

    const items = [
      {
        postId,
        userId,
        amount,
      },
    ];

    const order = {
      app_id: config.app_id,
      app_trans_id, // Sử dụng biến đã định nghĩa
      app_user: userId,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount, // Zalopay yêu cầu số tiền tính bằng đồng
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: '',
      callback_url: `https://743c-2402-800-6294-490a-1566-6255-b217-73d1.ngrok-free.app/donation/callback`,
    };

    // Tạo MAC cho dữ liệu
    const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order['mac'] = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
      const response = await axios.post(config.endpoint, null, {
        params: order,
      });
      console.log('Response:', response.data);

      // Kiểm tra và đảm bảo rằng response trả về có đủ dữ liệu
      if (response.data && response.data.return_code === 1) {
        return {
          return_code: response.data.return_code,
          return_message: response.data.return_message,
          sub_return_code: response.data.sub_return_code,
          sub_return_message: response.data.sub_return_message,
          zp_trans_token: response.data.zp_trans_token,
          order_url: response.data.order_url,
          order_token: response.data.order_token,
          app_trans_id: order.app_trans_id,
        };
      } else {
        // Trường hợp Zalopay trả về lỗi
        throw new HttpException(
          `Payment failed: ${response.data.return_message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error: any) {
      throw new HttpException(
        `Payment creation failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleZaloCallback(body: any) {
    const { data: dataStr, mac: reqMac } = body;
    console.log('Callback data:', dataStr, reqMac);
    const result: any = {};

    try {
      // Tạo MAC để kiểm tra tính hợp lệ
      const mac = CryptoJS.HmacSHA256(
        dataStr,
        this.configService.get<string>('ZALOPAY_KEY2'),
      ).toString();

      if (reqMac !== mac) {
        // Callback không hợp lệ
        result.return_code = -1;
        result.return_message = 'MAC not equal';
      } else {
        // Thanh toán thành công
        const dataJson = JSON.parse(dataStr);
        const items = JSON.parse(dataJson.item);

        const { postId, userId, amount } = items[0];
        console.log('Donation data:', postId, userId, amount);

        if (!postId || !userId || !amount) {
          throw new HttpException(
            'Invalid donation data',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Tạo bản ghi donation mới
        const newDonation = this.donationRepository.create({
          postId,
          userId,
          amount,
        });

        await this.donationRepository.save(newDonation);
        console.log('Donation saved:', newDonation);

        result.return_code = 1;
        result.return_message = 'success';
      }
    } catch (ex: any) {
      result.return_code = 0;
      result.return_message = ex.message;
    }

    return result;
  }

  async queryPayment(
    app_trans_id: string,
    postId: string,
    userId: string,
    amount: number,
  ) {
    const postData = {
      app_id: this.configService.get<string>('ZALOPAY_APP_ID'),
      app_trans_id,
      mac: '',
    };

    // Tạo MAC cho truy vấn
    const data = `${postData.app_id}|${postData.app_trans_id}|${this.configService.get<string>('ZALOPAY_KEY1')}`;
    postData.mac = CryptoJS.HmacSHA256(
      data,
      this.configService.get<string>('ZALOPAY_KEY1'),
    ).toString();

    try {
      const response = await axios.post(
        this.configService.get<string>('ZALOPAY_ENDPOINT_QUERY'),
        qs.stringify(postData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const responseData = response.data;

      // Kiểm tra return_code
      if (responseData.return_code === 1) {
        // Kiểm tra xem app_trans_id đã tồn tại chưa
        const existingDonation = await this.donationRepository.findOneBy({
          app_trans_id,
        });

        if (existingDonation) {
          return {
            message: 'Donation record already exists',
            donation: existingDonation,
            details: {
              return_code: responseData.return_code,
              return_message: responseData.return_message || 'Unknown error',
            },
          };
        }

        // Tạo bản ghi donation mới nếu không tồn tại
        const newDonation = this.donationRepository.create({
          postId,
          userId,
          amount,
          app_trans_id,
        });

        // Lưu bản ghi vào database
        await this.donationRepository.save(newDonation);

        return {
          message: 'Donation record created successfully',
          donation: newDonation,
          details: {
            return_code: responseData.return_code,
            return_message: responseData.return_message || 'Unknown error',
          },
        };
      } else {
        // Log lỗi khi return_code khác 1
        console.warn('Payment query did not succeed:', {
          app_trans_id,
          return_code: responseData.return_code,
          return_message: responseData.return_message || 'Unknown error',
        });

        // Trả về phản hồi hợp lý mà không ném lỗi
        return {
          message: 'Payment not completed',
          details: {
            return_code: responseData.return_code,
            return_message: responseData.return_message || 'Unknown error',
          },
        };
      }
    } catch (error: any) {
      // Log lỗi chi tiết khi có exception
      console.error('Error querying payment:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data, // Nếu axios trả về response
      });

      // Trả về phản hồi lỗi cho phía client
      return {
        message: 'Error querying payment',
        error: error.message,
      };
    }
  }
}
