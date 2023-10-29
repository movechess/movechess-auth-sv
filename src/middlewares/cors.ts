// Copyright 2023 Transflox LLC. All rights reserved.

import cors from "@koa/cors";

export const corsMiddleware = cors({
  origin: (ctx): string => {
    const validDomains = ["http://localhost:8080", "https://staging-11e08a6f.balue.xyz", "https://balue.xyz", "https://testnet.shimmpri.xyz", "http://127.0.0.1:8080"];
    if (validDomains.indexOf(ctx.request.header.origin!) !== -1) {
      return ctx.request.header.origin || "";
    }
    return "";
  },
  credentials: true,
});
