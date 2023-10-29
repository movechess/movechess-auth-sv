// Copyright 2023 Transflox LLC. All rights reserved.

import Koa from "koa";
import koaLogger from "koa-pino-logger";
import { client } from "./db";
import logger from "./utils/log";
import Router from "@koa/router";
import helmet from "koa-helmet";
import { corsMiddleware } from "./middlewares/cors";
import { cacheMiddleware } from "./middlewares/cache";
import { dateRangeMiddleware } from "./middlewares/date-range";
import { cronInit } from "./cron";
import { limiter } from "./middlewares/limiter";
import { notFound } from "./middlewares/not-found";
import bodyParser from "koa-bodyparser";
import { leaderboard, nftCollInit } from "./models/nft";
import { Collection } from "mongodb";
import { dbCollection } from "./db/collection";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import abi from "./abi/movechesscontract.json";
import { Keyring } from "@polkadot/api";

const keyring = new Keyring({ type: "sr25519" });

(async function main() {
  // create app
  const app = new Koa();

  app.use(cacheMiddleware);
  app.use(koaLogger());
  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.use(corsMiddleware);
  app.use(bodyParser());

  await client.connect().catch((err) => console.log("7s200:err", err));
  client.on("close", () => {
    client.connect();
  });

  await nftCollInit();

  // app router
  const router = new Router({ prefix: "/v1" });
  router.use(dateRangeMiddleware);

  let nftColl: Collection<any>;
  router.post("/", async (ctx) => {
    console.log("7s200:req", ctx.request.body);
    const { collection } = await dbCollection<any>(process.env.DB_LICHESS!, process.env.DB_LICHESS_COLLECTION_USER!);
    nftColl = collection;

    var myquery = { username: (ctx.request.body as any).username };
    var newvalues = { $set: { address: (ctx.request.body as any).address } };

    nftColl.updateOne(myquery, newvalues);

    ctx.body = { status: "success" };
  });

  router.post("/matching", async (ctx) => {
    ctx.body = ctx.request.body;
    const USER1_PHASE = "joke review pitch draft soap chief tackle coconut jar move scheme fire"; //5D4s8PFzAtY7sdnCCuC6n7nHCio19dPmwC6ytkQrWUZjCaXN - levien2506
    const user1_key = keyring.addFromUri(USER1_PHASE);

    const USER2_PHASE = "laundry doll chimney book hip veteran voice crop plastic pull possible vintage"; //5E7zwZHqCv53cWrFqfmaVBQ7u6dnWMR4dEdepAWBHAKx9LkH - levien2569
    const user2_key = keyring.addFromUri(USER2_PHASE);

    const provider = new WsProvider("wss://ws.test.azero.dev");
    const api = await ApiPromise.create({ provider: provider });

    const gasLimit = 3000n * 1000000n;
    const storageDepositLimit = null;
    const contract = new ContractPromise(api, abi, "5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK");

    const gameIndex = 0;
    const cost = 10000000000000;

    await contract.tx.matchGame({ storageDepositLimit, gasLimit }, { u32: gameIndex }, cost).signAndSend(user1_key, (result) => {
      console.log("7s200:matching", result);
    });
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(limiter);
  app.use(notFound);

  const port = 3333;

  // app
  app.listen(port);

  // app info
  logger.info({ thread: "main", data: "service started", port });

  cronInit();
})();
