import os
from typing import Final

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: Final[str] = os.getenv("DATABASE_URL", "sqlite:///db.sqlite3")
BACKEND_URL: Final[str] = os.getenv("BACKEND_URL", "http://localhost:8001")
UPLOAD_APP_URL: Final[str] = os.getenv("UPLOAD_APP_URL", "http://localhost:5173")
MARKETPLACE_APP_URL: Final[str] = os.getenv("MARKETPLACE_APP_URL", "http://localhost:5174")
ADMIN_APP_URL: Final[str] = os.getenv("ADMIN_APP_URL", "http://localhost:7012")
ENV: Final[str] = os.getenv("ENV", "local")
SECRET_KEY: Final[str] = os.getenv(
    "SECRET_KEY", "django-insecure-e@r8+=9i1et%kta%81(6#=&=-ls#$7d0kqzxw6ihpipxnd414k"
)
DEBUG: Final[bool] = os.getenv("DEBUG", "false") == "true"

KUBERNETES_SERVICE_HOST: Final[str] = os.getenv("KUBERNETES_SERVICE_HOST", "")
NO_COLOR: Final[bool] = os.getenv("NO_COLOR", "false") == "true"

PASSCODE_VALID_DAYS: Final[int] = int(os.getenv("PASSCODE_VALID_DAYS", "7"))

MINT_FOREVER_HEALTHCHECK_FILE_PATH: Final[str] = os.getenv(
    "HEALTHCHECK_FILE_PATH", "/tmp/healthy"
)
MINT_FOREVER_SLEEP_TIME_SECONDS: Final[int] = int(
    os.getenv("MINT_FOREVER_SLEEP_TIME_SECONDS", "60")
)


# SEI configuration (testnet defaults)
SEI_CHAIN_ID: Final[str] = os.getenv("SEI_CHAIN_ID", "atlantic-2")
SEI_RPC: Final[str] = os.getenv("SEI_RPC", "rest+https://sei-testnet-2-rest.brocha.in")
SEI_ADMIN_MNEMONIC: Final[str] = os.getenv(
    "SEI_ADMIN_MNEMONIC",
    "erode between wonder swim stay hidden option web rare acid stable matter tag mix skill marine inside spring pipe scare advice liquid shallow huge",
)
SEI_NFT_ADDRESS: Final[str] = os.getenv(
    "SEI_NFT_ADDRESS", "sei13hxtue98v4vzs25r8j5l0n3wukj6h05k73syguy8gs49jexhx2hqxslrx6"
)
NFT_MULTI_CODE_ID: Final[int] = int(os.getenv("NFT_MULTI_CODE_ID", "5649"))

# Storages

AWS_ACCESS_KEY_ID: Final[str] = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY: Final[str] = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_STORAGE_BUCKET_NAME: Final[str] = os.getenv("AWS_STORAGE_BUCKET_NAME", "")
AWS_S3_ENDPOINT_URL: Final[str] = os.getenv("AWS_S3_ENDPOINT_URL", "")
AWS_S3_CUSTOM_DOMAIN: Final[str] = os.getenv("AWS_S3_CUSTOM_DOMAIN", "")

NFT_STORAGE_API_URL: Final[str] = os.getenv(
    "NFT_STORAGE_API_URL", "https://s3.filebase.com"
)
IPFS_PINNING_SERVICE_URL: Final[str] = os.getenv(
    "IPFS_PINNING_SERVICE_URL", "https://api.filebase.io/v1/ipfs/pins"
)
NFT_STORAGE_BUCKET_NAME: Final[str] = os.getenv(
    "NFT_STORAGE_BUCKET_NAME", "replanttest"
)
NFT_STORAGE_ACCESS_KEY: Final[str] = os.getenv("NFT_STORAGE_API_KEY", "")
NFT_STORAGE_SECRET_ACCESS_KEY: Final[str] = os.getenv(
    "NFT_STORAGE_SECRET_ACCESS_KEY", ""
)
FILEBASE_IPFS_PINNINGS_SERVICE_ACCESS_TOKEN: Final[str] = os.getenv(
    "FILEBASE_IPFS_PINNINGS_SERVICE_ACCESS_TOKEN", ""
)


# Sendgrid

SENDGRID_API_KEY: Final[str] = os.getenv("SENDGRID_API_KEY", "")
FROM_EMAIL: Final[str] = os.getenv("FROM_EMAIL", "noreply-local@replantworld.ulam.pro")
