import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  config = {
    maxOutputTokens: 50,
  };

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({
      apiKey: apiKey!,
    });
  }

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
}
