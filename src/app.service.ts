import fetch from 'node-fetch';
import exifr from 'exifr';
import sharp from 'sharp';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateImageMetadataPayload } from './app.controller';
import { ethers } from 'ethers';
import { arrayify, toUtf8String } from 'ethers/lib/utils';
import { IPFSService } from 'parkydb/lib/core/ipfs';
import { TextDecoder } from 'util';
import { DigitalOcean } from 'digitalocean-js';
import { DBService } from './DBService';
import { tap } from 'rxjs';
import { Resolver } from 'did-resolver';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private dbService: DBService) {}

  async onModuleInit() {
  }
  // async getSubdomain() {
  //   const do = new DigitalOcean(process.env.DO_DNS)
  //   const domain = await client.domains.getExistingDomain('example.com');
  //   const request = {
  //     name: 'example.com',
  //     ip_address: '1.2.3.4'
  //   };
  //   const domain = await client.domains.createDomain(request);
  // }
  async createImageMetadataProvenance(payload: CreateImageMetadataPayload) {
    const gateway = `https://ipfs.infura.io`;
    const rpc = `https://ipfs.infura.io:5001`;
    const ipfs = new IPFSService(gateway, rpc);
    const rawResponse = await fetch(`${gateway}/ipfs/${payload.cid}`);

    const img = new Uint8Array(await rawResponse.arrayBuffer());

    const metadata2 = await exifr.parse(img, true);
    if (metadata2) {
      console.log(metadata2);
    }
    try {
      const blob = await sharp(img)
        .withMetadata({
          exif: {
            IFD0: {
              Copyright: `${payload.jwt}`,
              ImageDescription: `${payload.description}`,
              Artist: `${payload.address}`,
            },
            ExifIFD: {
              UserComment: `${payload.jwt}`,
            },
          },
        })
        .toBuffer();

      return blob;
    } catch (ee) {
      console.error(ee);
    }
  }
}
