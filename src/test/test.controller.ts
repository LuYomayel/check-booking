import { Controller } from '@nestjs/common';
import { TestService } from './test.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}
  @Cron(CronExpression.EVERY_MINUTE)
  async scraping() {
    return this.testService.scraping();
  }
}
