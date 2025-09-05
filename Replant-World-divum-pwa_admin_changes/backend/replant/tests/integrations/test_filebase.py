import io
import json
from unittest import mock

import boto3
import pytest
import requests
import responses
from django.core.files.uploadedfile import SimpleUploadedFile
from model_bakery import baker
from PIL import Image

import env
from replant.integrations import filebase
from replant.integrations.filebase import (
    FileDto,
    PinObjectDto,
    PinResponse,
    pin_file_to_ipfs,
    upload_file,
)
from replant.models.sponsor import Sponsor
from replant.models.tree import Tree
from replant.nft import _get_nft_metadata
from replant.tests.consts import PIN_FILE_SUCCESS_RESPONSE
from replant.tests.integrations.consts import SUCCESS_FILEBASE_UPLOAD_IMAGE_RESPONSE


@pytest.fixture
def image_to_upload() -> io.BytesIO:
    size = (800, 600)
    storage = io.BytesIO()
    img = Image.new("RGB", size)
    img.save(storage, "PNG")
    storage.seek(0)
    return storage


@mock.patch("boto3.client")
def test_filebase_upload(
    mock_boto_client: mock.MagicMock,
    image_to_upload: io.BytesIO,
) -> None:
    # mocks
    mock_s3 = mock.MagicMock()
    mock_boto_client.return_value = mock_s3
    mock_s3.put_object.return_value = SUCCESS_FILEBASE_UPLOAD_IMAGE_RESPONSE

    # when
    response = filebase.upload_to_bucket(
        dto=filebase.FileDto(file_name="red.png", content=image_to_upload)
    )

    # then
    assert response == filebase.UploadResponse.model_validate(
        SUCCESS_FILEBASE_UPLOAD_IMAGE_RESPONSE
    )


@responses.activate
def test_pin_file_to_ipfs() -> None:
    # given
    tree = baker.make(
        Tree,
        nft_id=1,
        image_cid="QmRwMjsNce88bva1CCzh7kQQAhjowYnxxaZPJKRjJmpQE3",
        minting_state=Tree.MintingState.TO_BE_MINTED,
    )

    # mocks
    responses.add(
        method="POST",
        url=env.IPFS_PINNING_SERVICE_URL,
        json=PIN_FILE_SUCCESS_RESPONSE,
    )

    # when
    pin_response = pin_file_to_ipfs(
        dto=PinObjectDto(cid=tree.image_cid, name=f"{tree.nft_id}.png")
    )

    # then
    assert pin_response == PinResponse.model_validate(PIN_FILE_SUCCESS_RESPONSE)


@pytest.mark.live_request
def test_upload_live(simple_uploaded_file: SimpleUploadedFile) -> None:
    # given
    sponsor = baker.make(Sponsor)
    tree_to_upload = baker.make(
        Tree,
        sponsor=sponsor,
        nft_id=1,
        image_cid="",
        metadata_cid="",
        image=simple_uploaded_file,
        minting_state=Tree.MintingState.TO_BE_MINTED,
    )
    tree_to_upload.refresh_from_db()

    # when & then
    uploaded_image_summary = upload_file(
        dto=FileDto(
            file_name=f"{tree_to_upload.nft_id}.png",
            content=io.BytesIO(tree_to_upload.image.file.read()),
        )
    )

    metadata = _get_nft_metadata(tree=tree_to_upload)
    uploaded_metadata_summary = upload_file(
        dto=FileDto(
            file_name=f"{tree_to_upload.nft_id}.json",
            content=io.BytesIO(json.dumps(metadata).encode()),
        )
    )

    # cleanup
    requests.delete(
        url=env.IPFS_PINNING_SERVICE_URL
        + f"/pins/{uploaded_image_summary.pin_request_id}",
        headers={
            "Authorization": f"Bearer {env.FILEBASE_IPFS_PINNINGS_SERVICE_ACCESS_TOKEN}"
        },
    )
    requests.delete(
        url=env.IPFS_PINNING_SERVICE_URL
        + f"/pins/{uploaded_metadata_summary.pin_request_id}",
        headers={
            "Authorization": f"Bearer {env.FILEBASE_IPFS_PINNINGS_SERVICE_ACCESS_TOKEN}"
        },
    )

    s3 = boto3.client(
        service_name="s3",
        endpoint_url=env.NFT_STORAGE_API_URL,
        aws_access_key_id=env.NFT_STORAGE_ACCESS_KEY,
        aws_secret_access_key=env.NFT_STORAGE_SECRET_ACCESS_KEY,
    )
    s3.delete_object(
        Bucket=env.NFT_STORAGE_BUCKET_NAME, Key=f"{tree_to_upload.nft_id}.png"
    )
    s3.delete_object(
        Bucket=env.NFT_STORAGE_BUCKET_NAME, Key=f"{tree_to_upload.nft_id}.json"
    )
