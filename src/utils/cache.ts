// Copyright 2023 Transflox LLC. All rights reserved.

export const cacheOptions = {
  max: 500,

  maxSize: 50_000,
  sizeCalculation: () => {
    return 1;
  },

  ttl: 1000 * 60 * 1,

  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,
};
