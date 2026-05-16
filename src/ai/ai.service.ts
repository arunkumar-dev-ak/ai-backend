import { GoogleGenAI } from '@google/genai';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  cleanJsonResponse,
  isDebugResponse,
  makeStructuredDebugPrompt,
} from './utils/ai-service.utils';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(AiService.name);
  config = {
    maxOutputTokens: 50,
  };
  debuggerConfig = {
    maxOutputTokens: 1000,
  };

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({
      apiKey: apiKey!,
    });
  }

  //simple promptwith raw response
  async generateText(prompt: string) {
    console.log('prompt', prompt);
    const response = await this.ai.models.generateContent({
      model: 'models/gemini-2.5-flash',
      contents: prompt,
      config: this.config,
    });
    console.log(response);

    return response.text;
  }

  //structured prompt with structured response
  async debugCode(code: string, language: string) {
    const prompt = makeStructuredDebugPrompt({
      code,
      language,
    });

    const response = await this.ai.models.generateContent({
      model: 'models/gemini-2.5-flash',
      contents: prompt,
      config: this.debuggerConfig,
    });

    const rawText = response.text;

    if (!rawText) {
      this.logger.warn(`Raw text not found for prompt ${prompt}`);
      throw new BadRequestException('Something Went Wrong.Please try again');
    }

    const cleaned: string = cleanJsonResponse(rawText);

    try {
      const parsed: unknown = JSON.parse(cleaned);

      if (isDebugResponse(parsed)) {
        return parsed;
      }

      return {
        error: 'Invalid AI structure',
        raw: rawText,
      };
    } catch {
      console.error('JSON parse failed', cleaned);
      return {
        error: 'Invalid AI response',
        raw: rawText,
      };
    }
  }
}
