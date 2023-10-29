// Copyright 2023 Transflox LLC. All rights reserved.

export const notFound = (ctx: any) => {
  ctx.body = "404 Not Found!!1";
  ctx.status = 404;
};
