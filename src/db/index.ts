// Copyright 2023 Transflox LLC. All rights reserved.

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URL!;

export const client = new MongoClient(uri);
