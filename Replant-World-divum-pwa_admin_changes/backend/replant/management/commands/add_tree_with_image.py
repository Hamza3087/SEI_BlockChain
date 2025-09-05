from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from replant.models import Tree, Species, PlantingOrganization, Country, User, Sponsor
from replant import clustering
from django.utils import timezone
import requests
import io
import os


class Command(BaseCommand):
    help = 'Add a new tree with a real image from URL or file path'

    def add_arguments(self, parser):
        parser.add_argument('--species', type=str, help='Species name')
        parser.add_argument('--organization', type=str, help='Organization name')
        parser.add_argument('--country', type=str, help='Country name')
        parser.add_argument('--sponsor', type=str, help='Sponsor name')
        parser.add_argument('--latitude', type=float, required=True, help='Latitude')
        parser.add_argument('--longitude', type=float, required=True, help='Longitude')
        parser.add_argument('--cost', type=int, default=15, help='Planting cost in USD')
        parser.add_argument('--native', action='store_true', help='Mark as native species')
        parser.add_argument('--image-url', type=str, help='URL to download tree image from')
        parser.add_argument('--image-path', type=str, help='Local path to tree image file')
        parser.add_argument('--mint', action='store_true', help='Automatically mint after creating')

    def download_image_from_url(self, url):
        """Download image from URL"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Get file extension from URL or content type
            content_type = response.headers.get('content-type', '')
            if 'jpeg' in content_type or 'jpg' in content_type:
                ext = 'jpg'
            elif 'png' in content_type:
                ext = 'png'
            else:
                ext = 'jpg'  # default
            
            filename = f'tree_image_{timezone.now().strftime("%Y%m%d_%H%M%S")}.{ext}'
            return ContentFile(response.content, name=filename)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to download image from URL: {e}'))
            return None

    def load_image_from_path(self, path):
        """Load image from local file path"""
        try:
            if not os.path.exists(path):
                self.stdout.write(self.style.ERROR(f'Image file not found: {path}'))
                return None
                
            with open(path, 'rb') as f:
                content = f.read()
            
            filename = os.path.basename(path)
            return ContentFile(content, name=filename)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to load image from path: {e}'))
            return None

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌳 Adding new tree with real image...'))
        
        # Validate image source
        if not options['image_url'] and not options['image_path']:
            self.stdout.write(self.style.ERROR('❌ Please provide either --image-url or --image-path'))
            return
        
        # Get or use defaults for required objects
        species = None
        if options['species']:
            species = Species.objects.filter(common_name__icontains=options['species']).first()
        if not species:
            species = Species.objects.first()
            
        organization = None
        if options['organization']:
            organization = PlantingOrganization.objects.filter(name__icontains=options['organization']).first()
        if not organization:
            organization = PlantingOrganization.objects.first()
            
        country = None
        if options['country']:
            country = Country.objects.filter(name__icontains=options['country']).first()
        if not country:
            country = Country.objects.first()
            
        sponsor = None
        if options['sponsor']:
            sponsor = Sponsor.objects.filter(name__icontains=options['sponsor']).first()
        if not sponsor:
            sponsor = Sponsor.objects.first()
            
        user = User.objects.filter(is_staff=False).first()
        if not user:
            user = User.objects.first()

        self.stdout.write(f'Using Species: {species.common_name}')
        self.stdout.write(f'Using Organization: {organization.name}')
        self.stdout.write(f'Using Country: {country.name}')
        self.stdout.write(f'Using Sponsor: {sponsor.name}')
        
        # Load image
        image_file = None
        if options['image_url']:
            self.stdout.write(f'Downloading image from: {options["image_url"]}')
            image_file = self.download_image_from_url(options['image_url'])
        elif options['image_path']:
            self.stdout.write(f'Loading image from: {options["image_path"]}')
            image_file = self.load_image_from_path(options['image_path'])
        
        if not image_file:
            self.stdout.write(self.style.ERROR('❌ Failed to load image. Aborting.'))
            return
        
        # Generate coordinates
        latitude = options['latitude']
        longitude = options['longitude']
        tile_index = clustering.get_tree_tile_index(latitude, longitude)
        
        # Create tree
        tree = Tree.objects.create(
            planting_organization=organization,
            review_state=Tree.ReviewState.APPROVED,
            minting_state=Tree.MintingState.TO_BE_MINTED,
            latitude=latitude,
            longitude=longitude,
            tile_index=tile_index,
            country=country,
            species=species,
            is_native=options['native'],
            planting_cost_usd=options['cost'],
            created_by=user,
            sponsor=sponsor,
            captured_at=timezone.now(),
        )
        
        # Save the real image
        tree.image.save(image_file.name, image_file, save=True)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Created Tree ID: {tree.id} at ({latitude:.4f}, {longitude:.4f})'
            )
        )
        self.stdout.write(f'📸 Image saved: {tree.image.name}')
        
        # Mint if requested
        if options['mint']:
            self.stdout.write(self.style.WARNING('🚀 Starting minting process...'))
            try:
                from replant import nft
                nft.mint_scheduled_nfts()
                
                # Check result
                tree.refresh_from_db()
                if tree.minting_state == Tree.MintingState.MINTED:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✅ Tree {tree.id} minted as NFT {tree.nft_id}! TX: {tree.nft_mint_tx}'
                        )
                    )
                    self.stdout.write(
                        f'🔗 Explorer: https://seitrace.com/tx/{tree.nft_mint_tx}?chain=atlantic-2'
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f'❌ Tree {tree.id} minting failed. State: {tree.minting_state}'
                        )
                    )
                        
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Minting failed: {e}'))
        
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Successfully created tree with real image!')
        )
