// Copyright 2023 Transflox LLC. All rights reserved.

import { scan } from "../action/scan";
import { createCron } from "../services/cron";
import logger from "../utils/log";

export const cronInit = () => {
  // https://crontab.cronhub.io/
  if (process.env.START_CRON === "true") {
    const scanJob = createCron("*/5 * * * * *", function () {
      logger.info({ thread: "cron", type: "game scan 5 seconds" });

      try {
        scan();
      } catch (e) {
        logger.info({ thread: "cron", type: "game scan 5 seconds", error: e });
      }
    });
    (() => {
      scanJob.start();

      logger.info({ thread: "cron", message: "cron started" });
    })();
  } else {
    logger.info({ thread: "cron", message: "do not start cron" });
  }
};
