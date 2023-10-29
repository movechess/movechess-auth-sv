// Copyright 2023 Transflox LLC. All rights reserved.

import * as ethers from "ethers";
import { dbCollection } from "../db/collection";
import { Document, Collection, WithId } from "mongodb";
import lodash from "lodash";
import logger from "../utils/log";

const httpProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL!);
// export const balue = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS!, abi, httpProvider);

export type NFT = {
  name: string;
  image: any;
  description: string;

  attributes: [
    {
      trait_type: "level";
      value: number;
    },
    {
      trait_type: "point";
      value: number;
    },
    {
      trait_type: "day";
      value: number;
    }
  ];

  seller_fee_basis_points: 0;

  compiler: "balue.xyz";
  external_url: "https://balue.xyz/";
};

type NFTDocument = NFT & {
  _id: number;
  owner: string;
  day: number;
  level: number;
  point: number;
} & Document;
type DBNFT = WithId<NFTDocument>;

let nftColl: Collection<NFTDocument>;

export const nftCollInit = async () => {
  const { collection } = await dbCollection<NFTDocument>(process.env.DB_LICHESS!, process.env.DB_LICHESS_COLLECTION_MATCHUP!);
  nftColl = collection;

  await nftColl.createIndex({ "attributes.[1].value": 1 });
  await nftColl.createIndex({ "attributes.[2].value": 1 });
  await nftColl.createIndex({ "attributes.[3].value": 1 });

  await nftColl.createIndex({ day: 1 });
  await nftColl.createIndex({ level: 1 });
  await nftColl.createIndex({ point: 1 });

  logger.info({ thread: "db", message: "db inited" });
};

const getNftByRange = async (day: number, level: number) => {
  const cursor = nftColl.aggregate([{ $match: { day, level } }, { $group: { _id: null, count: { $count: {} } } }]);

  for await (const event of cursor) {
    return event.count as number;
  }

  return 0;
};

export const handleNftId = async (id: number) => {
  logger.info({ thread: "handle", message: `handle NFT Id ${id}` });

  // const total = await getTotalSupply();

  // if (id >= total) {
  //   logger.info({ thread: "handle", message: `handle NFT id ${id}, but total supply is ${total}, return` });

  //   return;
  // }

  const dbNft = await isExist(id);

  if (dbNft) {
    logger.info({ thread: "handle", mesasge: `handle NFT id ${id}, existed dbNft` });

    logger.info({ thread: "handle", message: `handle NFT id ${id}, existed dbNft, do not exist s3Nft, create one` });

    return;
  }

  // const owner = await balue.ownerOf(id);
  // const day = (await getDayOfNFT(id)).toNumber();

  // const nft = await newNft(id, day);
  // await nftColl.insertOne({ ...nft, _id: id, owner, day, level: levelFromAttributes(nft), point: pointFromAttributes(nft) });
};

const luckyLevelRange = [0, ...Array(10).fill(1), ...Array(30).fill(2), ...Array(70).fill(3), ...Array(189).fill(4)];
const luckyMax = [1, 10, 30, 70, 189];
const luckyLevel = [5, 4, 3, 2, 1];

const range = [
  [100, 100],
  [95, 99],
  [80, 94],
  [50, 79],
  [0, 49],
];

const randomLuckyLevel = async (day: number) => {
  const current = lodash.sample(luckyLevelRange);
  const max = luckyMax[current];

  const count = await getNftByRange(day, current);
  if (count >= max) {
    return await randomLuckyLevel(day);
  }

  return current;
};

// export const getTotalSupply = async (): Promise<number> => {
//   return (await balue.totalSupply()) as number;
// };

const isExist = async (id: number): Promise<DBNFT> => {
  const nft = await nftColl.findOne({ _id: id });
  return nft;
};

// const getDayOfNFT = async (id: number) => {
//   const day = (await balue.dayOfNFT(id)) as ethers.BigNumber;

//   return day;
// };

const levelFromAttributes = (nft: NFT) => {
  return nft.attributes[0].value;
};

const pointFromAttributes = (nft: NFT) => {
  return nft.attributes[1].value;
};

// export const updateOwner = async (id: number) => {
//   const nft = await nftColl.findOne({ _id: id });

//   if (!nft) {
//     return;
//   }

//   const owner = await balue.ownerOf(id);

//   logger.info({ thread: "model", model: "nft", message: `update owner ${id} ${owner}` });

//   await nftColl.updateOne({ _id: id }, { $set: { owner } });
// };

export const leaderboard = async () => {
  const cursor = nftColl.aggregate<{ address: string; point: number }>([
    {
      $group: {
        _id: "$owner",
        point: {
          $sum: "$point",
        },
        count: {
          $count: {},
        },
      },
    },
    {
      $sort: {
        point: -1,
      },
    },
    {
      $project: {
        _id: 0,
        address: "$_id",
        point: "$point",
        count: "$count",
      },
    },
  ]);

  const items: { address: string; point: number }[] = [];

  for await (const item of cursor) {
    items.push(item);
  }

  return items;
};
