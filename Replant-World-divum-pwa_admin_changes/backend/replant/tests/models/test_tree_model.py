from model_bakery import baker

from replant.consts import FILEBASE_IPFS_STORAGE_URL, NFT_STORAGE_URL
from replant.models.tree import Tree, ipfs_filebase_url, ipfs_nft_storage_url


class TestTreeModel:
    def test_ipfs_url(self) -> None:
        # given
        nft_storage_tree = baker.make(
            Tree,
            nft_id=1,
            image_cid="123",
            metadata_cid="456",
            storage_provider=Tree.StorageProvider.NFT_STORAGE,
        )
        filebase_tree = baker.make(
            Tree,
            nft_id=2,
            image_cid="789",
            metadata_cid="012",
            storage_provider=Tree.StorageProvider.FILEBASE,
        )

        # when & then
        assert nft_storage_tree.ipfs_image_url == NFT_STORAGE_URL.format(
            cid=nft_storage_tree.image_cid,
            nft_id=nft_storage_tree.nft_id,
            extension="png",
        )
        assert nft_storage_tree.ipfs_metadata_url == NFT_STORAGE_URL.format(
            cid=nft_storage_tree.metadata_cid,
            nft_id=nft_storage_tree.nft_id,
            extension="json",
        )

        assert filebase_tree.ipfs_image_url == FILEBASE_IPFS_STORAGE_URL.format(
            cid=filebase_tree.image_cid
        )
        assert filebase_tree.ipfs_metadata_url == FILEBASE_IPFS_STORAGE_URL.format(
            cid=filebase_tree.metadata_cid
        )


def test_ipfs_nft_storage_url() -> None:
    # given
    cid = "123"
    nft_id = 1
    extension = "png"

    # when & then
    assert (
        ipfs_nft_storage_url(cid, nft_id, extension)
        == f"https://{cid}.ipfs.nftstorage.link/{nft_id}.{extension}"
    )
    assert ipfs_nft_storage_url(None, nft_id, extension) == ""


def test_ipfs_filebase_url() -> None:
    # given
    cid = "123"

    # when & then
    assert ipfs_filebase_url(cid) == f"https://ipfs.filebase.io/ipfs/{cid}"
    assert ipfs_filebase_url(None) == ""
