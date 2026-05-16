import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { DebugDto } from './dto/debug.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  checkChatGuard() {
    return 'hi';
  }

  @Post('chat')
  async chat(@Body('prompt') prompt: string) {
    const response = await this.aiService.generateText(prompt);
    return { response };
  }

  @Post('debug')
  async debug(@Body() body: DebugDto) {
    const result = await this.aiService.debugCode(body.code, body.language);

    return { result };
  }
}
