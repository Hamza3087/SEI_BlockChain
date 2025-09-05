import logging
import time
from pathlib import Path

from django.core.management.base import BaseCommand

import env
from replant import nft

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        logger.info("🔄 Mint forever started")
        while True:
            try:
                nft.mint_scheduled_nfts()
            except Exception as err:
                logger.exception(err)
            finally:
                Path(env.MINT_FOREVER_HEALTHCHECK_FILE_PATH).touch()
                time.sleep(env.MINT_FOREVER_SLEEP_TIME_SECONDS)
