import { Test, TestingModule } from '@nestjs/testing';
import { DonateController } from './donate.controller';
import { DonateService } from './donate.service';

describe('DonateController', () => {
  let controller: DonateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonateController],
      providers: [DonateService],
    }).compile();

    controller = module.get<DonateController>(DonateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
