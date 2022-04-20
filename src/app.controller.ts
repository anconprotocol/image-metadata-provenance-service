import { Body, Controller, Get, Post, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';

export class CreateImageMetadataPayload {
  cid: string;
  name: string;
  description: string;
  address: string;
  deviceSignerMake: string;
  deviceSignerModel: string;
  jwt: string;
}

@Controller('/api/v0')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/provenance_metadata')
  async createImageMetadataProvenance(
    @Body() payload: CreateImageMetadataPayload,
  ) {
    const blob = await this.appService.createImageMetadataProvenance(payload);
    return new StreamableFile(blob);
  }
}
