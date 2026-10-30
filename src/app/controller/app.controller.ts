import { Controller, Get } from '@nestjs/common';
import { AppService } from '../service/app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is up' })
  getHello(): string {
    return this.appService.getHello();
  }
}
