import ethr from 'ethr-did-resolver';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { defaultResolvers, ParkyDB } from 'parkydb';
import { FoundationDBAdapter } from 'parkydb-foundationdb';
import EthCrypto from 'eth-crypto';
import { Resolver } from 'did-resolver';
import { tap } from 'rxjs';
import { ethers } from 'ethers';

@Injectable()
export class DBService implements OnModuleInit, OnModuleDestroy {
  parky: ParkyDB=new ParkyDB('');
  identity: { privateKey: string; publicKey: string; address: string };
  defaultTopic = `/du/storage/1/cbor`;
  currentPubsub: any;
  onIncomingCancel: any;
  onIncoming: any;

  constructor() {}
  onModuleDestroy() {
    // this.db.close()
  }
  async onModuleInit() {
    // create new identity for waku messaging
    ///    this.identity = EthCrypto.createIdentity();
    try {
        const w = ethers.Wallet.createRandom();
this.parky=new ParkyDB("du")
        // this.network = await web3provider.getNetwork()
      await this.parky.initialize({
        withDB: {
          provider: FoundationDBAdapter,
          options: {
            name: 'du',
          },
        },
        withWallet: false,
        graphql: { resolvers: defaultResolvers },
        enableSync: false,
        wakuconnect: {
          bootstrap: { peers: [process.env.WakuLibp2p] },
        },
        withWeb3: {
          defaultAddress: await
           w.getAddress(),
        },
        withIpfs: {
          gateway: 'https://ipfs.infura.io',
          api: process.env.IPFS,
        },
      });
debugger
      // @ts-ignore
      const pubsub = await this.parky.createTopicPubsub(this.defaultTopic, {
        middleware: {
          incoming: [tap()],
          outgoing: [tap()],
        },
        blockCodec: this.parky.defaultBlockCodec as any,
        canSubscribe: true,
        canPublish: true,
        isKeyExchangeChannel: false,
        isCRDT: true,
      });
      this.currentPubsub = pubsub;
      this.onIncomingCancel = pubsub.onBlockReply$.subscribe(async (msg) => {
        debugger;
        if (msg.event === 'findCid') {
          const res = await this.parky.get(msg.payload, ['blockdb']);
          pubsub.publish(res);
        } else if (msg.event === 'pushBlock') {
          await this.parky.put(msg.cid, msg.payload, ['blockdb']);
        } else if (msg.event === 'pushToAncon') {
          const ethrResolver = ethr.getResolver({});
          const resolver = new Resolver(ethrResolver);
          const didrs = await resolver.resolve(msg.payload.from);
          msg.payload.from = didrs.didDocument.id;
          debugger;
          // await this.parky.putBlock(msg.payload);

          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg.payload),
          };

          // @ts-ignore
          const rawResponse = await fetch(
            // @ts-ignore
            `${process.env.AnconAPI}/v0/dag`,
            requestOptions,
          );
          const dagblock = await rawResponse.json();
          pubsub.publish(dagblock);
        } else {
          pubsub.publish({
            cid: '',
            dag: null,
            document: null,
            timestamp: new Date().getTime(),
            uuid: '',
          });
        }
        // @ts-ignore
      });
    } catch (e) {
      debugger;
      console.error(e);
    }
  }
}
