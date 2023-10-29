// Copyright 2023 Transflox LLC. All rights reserved.

export default function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
