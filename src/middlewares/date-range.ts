// Copyright 2023 Transflox LLC. All rights reserved.

import { isValidISODateString } from "iso-datestring-validator";
import { DateRange } from "../services/date-range";
import Koa from "koa";

export const dateRangeMiddleware = async (ctx: any, next: Koa.Next) => {
  const dateRange = new DateRange();
  const from = Array.isArray(ctx.query["fromTime"]) ? ctx.query["fromTime"][0] : ctx.query["fromTime"];
  if (from && isValidISODateString(from)) {
    dateRange.setFrom(from);
  }
  const to = Array.isArray(ctx.query["toTime"]) ? ctx.query["toTime"][0] : ctx.query["toTime"];
  if (to && isValidISODateString(to)) {
    dateRange.setTo(to);
  }

  ctx.dateRange = dateRange;
  await next();
};
