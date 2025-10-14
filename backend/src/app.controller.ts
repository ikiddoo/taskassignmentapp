import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * @returns Application status message
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * API health check endpoint
   * @returns Health status object
   */
  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Task Assignment API',
    };
  }
}
