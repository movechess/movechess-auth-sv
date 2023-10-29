// Copyright 2023 Transflox LLC. All rights reserved.

import { dbCollection } from "../db/collection";
import logger from "../utils/log";
import { Collection } from "mongodb";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { BN, BN_ONE } from "@polkadot/util";
import abi from "../abi/movechesscontract.json";
import { Keyring } from "@polkadot/api";

const keyring = new Keyring({ type: "sr25519" });
const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);

let nftColl: Collection<any>;

export const scan = async () => {
  logger.info({ thread: "scan", message: "scan game started" });
  const { collection } = await dbCollection<any>(process.env.DB_LICHESS!, process.env.DB_LICHESS_COLLECTION_MATCHUP!);
  nftColl = collection;
  const cursor = nftColl.find();

  for await (const item of cursor) {
    const winner = 1;
    // if (item.s1 > item.s2) {
    //   winner = 0;
    // } else {
    //   winner = 0;
    // }
    const provider = new WsProvider("wss://ws.test.azero.dev");
    const api = await ApiPromise.create({ provider: provider });

    const gasLimit = 3000n * 10000000n;
    const storageDepositLimit = null;
    const contract = new ContractPromise(api, abi, "5FZuewwFgS6jwi5RsCPPxqRTSf2NcvwRrXbu3xRrUqxCRHt6");

    const PHRASE = "provide toy deposit expect popular mesh undo resist jazz pizza wolf churn";
    const newPair = keyring.addFromUri(PHRASE);

    const gameIndex = 2;
    // const { result, output } = await contract.query.getGameInfo(newPair.address, { value: 0, gasLimit: -1 }, gameIndex);
    // console.log("7s200:counter:", result, output);

    const a = await contract.tx.updateWinner({ storageDepositLimit, gasLimit }, { u32: gameIndex }, { u32: winner }).signAndSend(newPair, (result) => {
      console.log("7s200:sign->update winner-> user a win", result);
    });
  }
};
