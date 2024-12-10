import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DonateService } from './donate.service';
import {
  CreateDonationRequest,
  DonationResponse,
  GetDonationsRequest,
  DonationsResponse,
} from 'common/interface/donation.interface';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('donation')
export class DonateController {
  constructor(private zaloPaymentService: DonateService) {}

  @Post('/payment')
  async createPayment(@Body() body: any) {
    return await this.zaloPaymentService.createPayment(body);
  }

  //GET DONATIONS
  @GrpcMethod('PostService', 'GetDonations')
  async findAll(data: GetDonationsRequest): Promise<DonationsResponse> {
    return this.zaloPaymentService.getDonation(data);
  }

  //CREATE Donation
  @GrpcMethod('PostService', 'CreateDonation')
  async createDonation(data: CreateDonationRequest): Promise<DonationResponse> {
    const donationResponse = await this.zaloPaymentService.createPayment(data);
    console.log('DonationResponse:', donationResponse); // Kiểm tra dữ liệu trả về
    return donationResponse;
  }

  @Post('/callback')
  async callbackPayment(@Body() body: any) {
    return await this.zaloPaymentService.handleZaloCallback(body);
  }

  // @GrpcMethod('PostService', 'CreateDonation')
  // async checkOrderStatus1(data: CreateDonationRequest): Promise<DonationResponse> {
  //   return this.zaloPaymentService.queryPayment(data);
  // }

  @Get('/order-status/:app_trans_id')
  async checkOrderStatus(
    @Param('app_trans_id') app_trans_id: string,
    @Query('postId') postId: string,
    @Query('userId') userId: string,
    @Query('amount') amount: number,
  ) {
    return await this.zaloPaymentService.queryPayment(
      app_trans_id,
      postId,
      userId,
      amount,
    );
  }
}
