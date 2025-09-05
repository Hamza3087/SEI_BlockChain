import io
import itertools
import json
import logging
import time
import traceback
from typing import Callable, Sequence, TypeVar

from cosmpy.aerial.exceptions import BroadcastError
from cosmpy.aerial.wallet import LocalWallet
from django.db import models, transaction
from django.utils import timezone
from PIL import Image

import env
from replant.integrations import filebase
from replant.models import History, Species, Tree
from replant.sdk import CW721Client, MintInfo, get_sei_client

logger = logging.getLogger(__name__)


GENERATE_ID_BATCH_SIZE = 500

FILE_UPLOAD_BATCH_SIZE = 100

MINT_BATCH_SIZE = 500

THUMBNAIL_SIZE = (512, 1024)

client = get_sei_client(env.SEI_CHAIN_ID, env.SEI_RPC)
cw721 = CW721Client(client, env.SEI_NFT_ADDRESS)
admin = LocalWallet.from_mnemonic(env.SEI_ADMIN_MNEMONIC, "sei")


SIZE_PER_ROUND = 50


@transaction.atomic
def mint_scheduled_nfts():
    logger.info("📦 Mint scheduled NFTs function called")
    trees = list(
        Tree.objects.filter(
            minting_state=Tree.MintingState.TO_BE_MINTED
        ).select_related(
            "species",
            "planting_organization",
            "country",
            "created_by",
            "sponsor",
        )[
            :SIZE_PER_ROUND
        ]
    )

    if len(trees) == 0:
        return

    logger.info(f"Found {len(trees)} NFTs to be minted")

    _batch_operation(
        action="Generating NFT IDs",
        func=_generate_nft_id,
        trees_to_batch=trees,
        all_trees=trees,
        batch_size=GENERATE_ID_BATCH_SIZE,
    )

    # Upload images.
    trees_no_image_cid = [tree for tree in trees if not tree.image_cid]
    logger.info(f"{len(trees_no_image_cid)} NFTs need image upload")
    _batch_operation(
        action="Uploading images",
        func=_upload_images,
        trees_to_batch=trees_no_image_cid,
        all_trees=trees,
        batch_size=FILE_UPLOAD_BATCH_SIZE,
    )

    # Upload metadata.
    trees_no_metadata_cid = [tree for tree in trees if not tree.metadata_cid]
    logger.info(f"{len(trees_no_metadata_cid)} NFTs need metadata upload")
    _batch_operation(
        action="Uploading metadata",
        func=_upload_metadatas,
        trees_to_batch=trees_no_metadata_cid,
        all_trees=trees,
        batch_size=FILE_UPLOAD_BATCH_SIZE,
    )

    # Mint tokens.
    logger.info(f"{len(trees)} NFTs need minting")
    sorted_trees = sorted(trees, key=lambda tree: tree.sponsor.id)
    trees_by_sponsor = itertools.groupby(sorted_trees, lambda tree: tree.sponsor)
    for sponsor, sponsor_trees in trees_by_sponsor:
        for tx, minted_trees in _batch_operation(
            action=f"Minting for sponsor {sponsor.name}",
            func=_mint_nfts,
            trees_to_batch=list(sponsor_trees),
            batch_size=MINT_BATCH_SIZE,
        ):
            minted_tree_ids = [tree.id for tree in minted_trees]
            minted_nft_ids = [tree.nft_id for tree in minted_trees]
            details = [
                f"TX: {tx}",
                "\nMinted tree IDs:",
                str(minted_tree_ids),
                "\nMinted NFT IDs:",
                str(minted_nft_ids),
            ]
            History.objects.create(
                event_type=History.EventType.MINTING_SUCCEED,
                message=f"Minted {len(minted_trees)} NFTs",
                details="\n".join(details),
            )


T = TypeVar("T")


def _batch_operation(
    action: str,
    func: Callable[[Sequence[Tree]], T],
    trees_to_batch: Sequence[Tree],
    batch_size: int,
    all_trees: list[Tree] | None = None,
) -> list[T]:
    logger.info(f"{action}...")

    result: list[T] = []
    for i in range(0, len(trees_to_batch), batch_size):
        trees_page = trees_to_batch[i : i + batch_size]  # noqa:E203
        logger.info(
            f"Batch {i + 1} - {min(i + batch_size, len(trees_to_batch))} / {len(trees_to_batch)}..."
        )
        try:
            result.append(func(trees_page))
        except Exception as err:
            logger.exception(err)
            tree_ids = [p.id for p in trees_page]
            Tree.objects.filter(id__in=tree_ids).update(
                minting_state=Tree.MintingState.FAILED
            )
            message = f"{action} ({len(trees_page)} trees)"
            if isinstance(err, BroadcastError):
                message += " (out of gas?)"
            History.objects.create(
                event_type=History.EventType.MINTING_FAILED,
                message=message,
                details=f"Tree IDs:\n{tree_ids}\n\n{traceback.format_exc()}",
            )
            if all_trees:
                # Exclude failed trees from further processing.
                for tree in trees_page:
                    all_trees.remove(tree)
    return result


def _generate_nft_id(trees: Sequence[Tree]):
    # Find the next available NFT ID by checking actual blockchain state
    try:
        # Check a wide range to find the highest existing NFT ID
        highest_nft_id = 0

        # Check ranges where NFTs might exist
        ranges_to_check = [range(1, 100), range(100, 200)]

        for nft_range in ranges_to_check:
            found_any = False
            for nft_id in nft_range:
                try:
                    cw721.contract.query({'nft_info': {'token_id': str(nft_id)}})
                    highest_nft_id = max(highest_nft_id, nft_id)
                    found_any = True
                except:
                    continue  # NFT doesn't exist, continue checking

            # If no NFTs found in this range, stop checking higher ranges
            if not found_any:
                break

        # Also check database to avoid conflicts
        last_id_in_db = Tree.objects.aggregate(models.Max("nft_id"))["nft_id__max"] or 0

        # Use the maximum of both to ensure no conflicts
        last_id = max(highest_nft_id, last_id_in_db)

        logger.info(f"NFT ID generation: highest_on_chain={highest_nft_id}, db={last_id_in_db}, using={last_id}")

    except Exception as e:
        logger.warning(f"Could not query blockchain for NFT IDs, using database only: {e}")
        last_id = Tree.objects.aggregate(models.Max("nft_id"))["nft_id__max"] or 0

    to_update: list[Tree] = []
    for tree in trees:
        if tree.nft_id:
            continue
        last_id += 1
        tree.nft_id = last_id
        to_update.append(tree)

    Tree.objects.bulk_update(to_update, ["nft_id"])


def _upload_images(trees: Sequence[Tree]) -> None:
    for tree in trees:
        assert tree.nft_id
        assert tree.image.file
        original_stream = io.BytesIO(tree.image.file.read())
        image = Image.open(original_stream)
        image.thumbnail(THUMBNAIL_SIZE)

        stream = io.BytesIO()
        image.save(stream, "PNG")
        stream.seek(0)

        # TODO: Make it async to speed up the process.
        uploaded_file_summary = filebase.upload_file(
            dto=filebase.FileDto(
                file_name=f"{tree.nft_id}.png",
                content=stream,
            )
        )
        tree.image_cid = uploaded_file_summary.cid

    Tree.objects.bulk_update(trees, ["image_cid"])


def _upload_metadatas(trees: Sequence[Tree]):
    for tree in trees:
        assert tree.nft_id
        metadata = _get_nft_metadata(tree)
        stream = io.BytesIO(json.dumps(metadata).encode())

        # TODO: Make it async to speed up the process.
        uploaded_file_summary = filebase.upload_file(
            dto=filebase.FileDto(file_name=f"{tree.nft_id}.json", content=stream),
        )
        tree.metadata_cid = uploaded_file_summary.cid

    Tree.objects.bulk_update(trees, ["metadata_cid"])


def _get_nft_metadata(tree: Tree):
    return {
        "edition": 1,
        "symbol": "RPLNT",
        "collection": "Replant World",
        "name": tree.species.common_name,
        "description": "https://replantworld.io",
        "image": tree.ipfs_image_url,
        "attributes": [
            {"trait_type": "Botanical Name", "value": tree.species.botanical_name},
            {
                "trait_type": "IUCN status",
                "value": Species.IucnStatus(tree.species.iucn_status).name,
            },
            {"trait_type": "Country", "value": tree.country.name},
            {"trait_type": "Longitude", "value": str(tree.longitude)},
            {"trait_type": "Latitude", "value": str(tree.latitude)},
            {
                "trait_type": "Is Native",
                "value": "Yes" if tree.is_native else "No",
            },
            {
                "trait_type": "Org/Community",
                "value": tree.planting_organization.name,
            },
            {"trait_type": "planter", "value": tree.created_by.get_username()},
            {"trait_type": "Date planted", "value": str(tree.created_at.date())},
            {"trait_type": "Sponsor", "value": tree.sponsor.name},
            {
                "trait_type": "planting Cost",
                "value": f"${tree.planting_cost_usd}",
            },
        ],
    }


def _mint_nfts(trees: Sequence[Tree]) -> tuple[str, Sequence[Tree]]:
    # Can only set 1 owner when using multi-mint.
    assert len(set(tree.sponsor for tree in trees)) == 1

    tokens: list[MintInfo] = []
    for tree in trees:
        assert tree.nft_id
        assert tree.ipfs_metadata_url
        tokens.append(
            {
                "token_id": str(tree.nft_id),
                "token_uri": tree.ipfs_metadata_url,
            }
        )

    tx = cw721.multi_mint(
        admin=admin,
        owner=tree.sponsor.wallet_address,
        tokens=tokens,
    )
    logger.info(f"NFTs minted. TX: {tx.tx_hash}")

    tree_ids = [tree.pk for tree in trees]
    Tree.objects.filter(id__in=tree_ids).update(
        minting_state=Tree.MintingState.MINTED,
        nft_mint_tx=tx.tx_hash,
        minted_at=timezone.now(),
    )

    # Wait for account sequence to update.
    time.sleep(1)

    return tx.tx_hash, trees
