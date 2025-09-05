import io
from dataclasses import dataclass

import boto3
import requests
from pydantic import BaseModel, Field
from retry import retry

import env


class UploadResponseHeaders(BaseModel):
    etag: str
    cid: str = Field(alias="x-amz-meta-cid")


class UploadResponseMetadata(BaseModel):
    status_code: int = Field(alias="HTTPStatusCode")
    headers: UploadResponseHeaders = Field(alias="HTTPHeaders")


class UploadResponse(BaseModel):
    metadata: UploadResponseMetadata = Field(alias="ResponseMetadata")


@dataclass
class FileDto:
    file_name: str
    content: io.BytesIO


@retry(delay=1, backoff=2, tries=3)
def upload_to_bucket(dto: FileDto) -> UploadResponse:
    s3 = boto3.client(
        service_name="s3",
        endpoint_url=env.NFT_STORAGE_API_URL,
        aws_access_key_id=env.NFT_STORAGE_ACCESS_KEY,
        aws_secret_access_key=env.NFT_STORAGE_SECRET_ACCESS_KEY,
    )
    upload_response = s3.put_object(
        Body=dto.content, Bucket=env.NFT_STORAGE_BUCKET_NAME, Key=dto.file_name
    )
    return UploadResponse.model_validate(upload_response)


@dataclass
class PinObjectDto:
    cid: str
    name: str


class PinResponse(BaseModel):
    request_id: str = Field(alias="requestid")


@retry(delay=1, backoff=2, tries=3)
def pin_file_to_ipfs(dto: PinObjectDto) -> PinResponse:
    r = requests.post(
        url=env.IPFS_PINNING_SERVICE_URL,
        headers={
            "Authorization": f"Bearer {env.FILEBASE_IPFS_PINNINGS_SERVICE_ACCESS_TOKEN}"
        },
        data={"cid": dto.cid, "name": dto.name},
    )
    r.raise_for_status()
    return PinResponse.model_validate(r.json())


@dataclass
class UploadedFileSummary:
    cid: str
    pin_request_id: str


def upload_file(dto: FileDto) -> UploadedFileSummary:
    upload_response = upload_to_bucket(dto=dto)
    cid = upload_response.metadata.headers.cid

    pin_response = pin_file_to_ipfs(dto=PinObjectDto(cid=cid, name=dto.file_name))
    return UploadedFileSummary(cid=cid, pin_request_id=pin_response.request_id)
