import logging
import subprocess
import sys

from admin_auto_filters.filters import AutocompleteFilterFactory
from django.contrib import admin, messages
from django.db import models
from django.http.request import HttpRequest

from replant.models import TreeToMint

from .tree import TreeAdmin

logger = logging.getLogger(__name__)


@admin.register(TreeToMint)
class TreeToMintAdmin(TreeAdmin):
    actions = ("mint_nfts", "auto_mint_nfts")

    list_filter = [
        AutocompleteFilterFactory(title="Sponsor", base_parameter_name="sponsor"),
        "minting_state",
    ]

    @admin.action(description="Mint NFTs")
    def mint_nfts(self, request: HttpRequest, queryset: models.QuerySet[TreeToMint]):
        logger.info("🎯 Admin mint NFTs action triggered")
        # Check if trees have sponsors
        trees_without_sponsors = queryset.filter(sponsor__isnull=True)
        if trees_without_sponsors.exists():
            messages.warning(
                request, 
                f"{trees_without_sponsors.count()} trees don't have sponsors assigned and cannot be minted."
            )
        
        # Only mark trees with sponsors for minting
        trees_to_mint = queryset.filter(sponsor__isnull=False)
        if trees_to_mint.exists():
            trees_to_mint.update(minting_state=TreeToMint.MintingState.TO_BE_MINTED)
            messages.success(
                request, 
                f"Marked {trees_to_mint.count()} trees to be minted as NFTs. "
                "The mint_forever background process will handle the actual minting."
            )
            
            # Check if mint_forever service is running
            try:
                import env
                if not env.NFT_STORAGE_ACCESS_KEY:
                    messages.warning(
                        request,
                        "Warning: NFT_STORAGE_ACCESS_KEY is not configured. "
                        "Minting will fail at the image upload step. "
                        "Please configure the storage credentials in your .env file."
                    )
            except Exception:
                pass
        else:
            messages.error(
                request, 
                "No trees with sponsors found to mint."
            )

    @admin.action(description="Auto Mint NFTs (Direct)")
    def auto_mint_nfts(self, request: HttpRequest, queryset: models.QuerySet[TreeToMint]):
        """
        Directly mint NFTs without waiting for background process.
        This action runs the complete minting process immediately.
        """
        logger.info("🎯 Admin auto mint NFTs action triggered")
        try:
            # Run the auto mint command
            result = subprocess.run(
                [
                    "python", "manage.py", "auto_mint", "--all"
                ],
                capture_output=True,
                text=True,
                cwd="/app"
            )
            
            if result.returncode == 0:
                messages.success(
                    request,
                    f"Successfully minted NFTs! Check the logs for details."
                )
                logger.info(f"Auto mint completed: {result.stdout}")
            else:
                messages.error(
                    request,
                    f"Failed to mint NFTs. Error: {result.stderr}"
                )
                logger.error(f"Auto mint failed: {result.stderr}")
                
        except Exception as e:
            messages.error(
                request,
                f"Error running auto mint: {str(e)}"
            )
            logger.exception("Auto mint exception")
