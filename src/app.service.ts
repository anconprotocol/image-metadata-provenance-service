import fetch from 'node-fetch';

import sharp from 'sharp';
import { Injectable } from '@nestjs/common';
import { CreateImageMetadataPayload } from './app.controller';
import { ethers } from 'ethers';
import { arrayify, toUtf8String } from 'ethers/lib/utils';
import { IPFSService } from 'parkydb/lib/core/ipfs';

@Injectable()
export class AppService {
  async createImageMetadataProvenance(payload: CreateImageMetadataPayload) {
    const gateway = `https://ipfs.infura.io`;
    const rpc = `https://ipfs.infura.io:5001`;
    const ipfs = new IPFSService(gateway, rpc);
    const rawResponse = await fetch(`${gateway}/ipfs/${payload.cid}`);

    const img = new Uint8Array(await rawResponse.arrayBuffer());

    const metadata = await sharp(img).metadata();
    if (metadata.exif) {
      console.log(toUtf8String(metadata.exif));
    }
    const imageDigest = ethers.utils.sha256(new Uint8Array(img));
    try {
      const blob = await sharp(img)
        .withMetadata({
          IFD0: {
            Copyright: `${payload.address}`,
            ProcessingSoftware: `du.`,
            SubfileType: 1,
            ImageWidth: metadata.width,
            ImageHeight: metadata.height,
            ImageDescription: `${payload.description}`,
            DocumentName: `${payload.name}`,
            Make: `${payload.deviceSignerMake}`,
            Model: `${payload.deviceSignerModel}`,
            Artist: `${payload.address}`,
            RawImageDigest: `${imageDigest}`,
            OriginalRawFileDigest: `${imageDigest}`,
          },
          ExifIFD: {
            UserComment: `${payload.jwt}`,
          },
        })
        .toBuffer();


      
      return blob;
    } catch (ee) {
      console.error(ee);
    }
  }
}
