import djclick as click
import logging
from django.db import transaction
from django.utils import timezone
from django.db import models

from replant.models import Tree
from replant import nft
import env

logger = logging.getLogger(__name__)


@click.command()
@click.option(
    "--tree-id",
    type=int,
    help="Specific tree ID to mint",
)
@click.option(
    "--all",
    is_flag=True,
    help="Mint all eligible trees",
)
def auto_mint(tree_id, all):
    """
    Automated NFT minting process.
    This command handles the complete minting workflow:
    1. Mark trees for minting
    2. Generate NFT IDs
    3. Upload images and metadata to storage
    4. Mint NFTs on blockchain
    """
    logger.info("🚀 Auto mint command started ")
    if tree_id:
        trees = Tree.objects.filter(id=tree_id)
    elif all:
        # Get trees that are approved, have sponsors, and not minted
        trees = Tree.objects.filter(
            sponsor__isnull=False,
            review_state=Tree.ReviewState.APPROVED,
        ).exclude(minting_state=Tree.MintingState.MINTED)
    else:
        click.echo("Please specify --tree-id or --all")
        return
    
    if not trees.exists():
        click.echo("No trees found to mint.")
        return
    
    click.echo(f"Found {trees.count()} trees to process")
    
    # Step 1: Mark trees for minting
    click.echo("\nStep 1: Marking trees for minting...")
    trees.update(minting_state=Tree.MintingState.TO_BE_MINTED)
    click.echo(f"  ✅ Marked {trees.count()} trees for minting")
    
    # Step 2: Generate NFT IDs
    click.echo("\nStep 2: Generating NFT IDs...")
    max_nft_id = Tree.objects.aggregate(models.Max("nft_id"))["nft_id__max"] or 0
    for i, tree in enumerate(trees):
        if not tree.nft_id:
            tree.nft_id = max_nft_id + i + 1
            tree.save()
            click.echo(f"  Generated NFT ID {tree.nft_id} for tree {tree.id}")
    
    # Step 3: Upload images and metadata using the proper storage mechanism
    click.echo("\nStep 3: Uploading images and metadata...")
    try:
        # Use the existing nft module's upload functions
        trees_list = list(trees)
        
        # Upload images
        trees_no_image_cid = [tree for tree in trees_list if not tree.image_cid]
        if trees_no_image_cid:
            click.echo(f"  Uploading {len(trees_no_image_cid)} images...")
            nft._upload_images(trees_no_image_cid)
            click.echo("  ✅ Images uploaded successfully")
        
        # Upload metadata
        trees_no_metadata_cid = [tree for tree in trees_list if not tree.metadata_cid]
        if trees_no_metadata_cid:
            click.echo(f"  Uploading {len(trees_no_metadata_cid)} metadata files...")
            nft._upload_metadatas(trees_no_metadata_cid)
            click.echo("  ✅ Metadata uploaded successfully")
            
    except Exception as e:
        click.echo(f"  ❌ Storage upload failed: {str(e)}")
        click.echo("  Please check your storage credentials in .env file")
        return
    
    # Step 4: Mint NFTs
    click.echo("\nStep 4: Minting NFTs...")
    for tree in trees_list:
        click.echo(f"  Minting NFT {tree.nft_id} for tree {tree.id}...")
        
        try:
            tx = nft.cw721.multi_mint(
                admin=nft.admin,
                owner=tree.sponsor.wallet_address,
                tokens=[
                    {
                        "token_id": str(tree.nft_id),
                        "token_uri": tree.ipfs_metadata_url,
                    }
                ],
            )
            
            # Update tree status
            tree.minting_state = Tree.MintingState.MINTED
            tree.nft_mint_tx = tx.tx_hash
            tree.minted_at = timezone.now()
            tree.save()
            
            click.echo(f"  ✅ NFT {tree.nft_id} minted successfully!")
            click.echo(f"  Transaction: {tx.tx_hash}")
            click.echo(f"  Owner: {tree.sponsor.wallet_address}")
            
        except Exception as e:
            click.echo(f"  ❌ Minting failed: {str(e)}")
            tree.minting_state = Tree.MintingState.FAILED
            tree.save()
    
    click.echo(f"\n🎉 Automated minting process completed!")
    click.echo(f"Successfully processed {trees.count()} trees") 