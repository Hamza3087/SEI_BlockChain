from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from replant.models import Tree, Species, PlantingOrganization, Country, User, Sponsor
from replant import clustering
from django.utils import timezone
from PIL import Image, ImageDraw, ImageFont
import io
import random


class Command(BaseCommand):
    help = 'Add a new tree and optionally mint it as NFT'

    def add_arguments(self, parser):
        parser.add_argument('--species', type=str, help='Species name (will use first available if not specified)')
        parser.add_argument('--organization', type=str, help='Organization name (will use first available if not specified)')
        parser.add_argument('--country', type=str, help='Country name (will use first available if not specified)')
        parser.add_argument('--sponsor', type=str, help='Sponsor name (will use first available if not specified)')
        parser.add_argument('--latitude', type=float, default=None, help='Latitude (random if not specified)')
        parser.add_argument('--longitude', type=float, default=None, help='Longitude (random if not specified)')
        parser.add_argument('--cost', type=int, default=15, help='Planting cost in USD (default: 15)')
        parser.add_argument('--native', action='store_true', help='Mark as native species')
        parser.add_argument('--mint', action='store_true', help='Automatically mint after creating')
        parser.add_argument('--count', type=int, default=1, help='Number of trees to create (default: 1)')

    def create_tree_image(self, tree_id, species_name='Tree'):
        """Create a unique test image for the tree"""
        colors = ['#228B22', '#32CD32', '#90EE90', '#006400', '#8FBC8F']
        bg_color = random.choice(colors)
        
        img = Image.new('RGB', (400, 400), color=bg_color)
        draw = ImageDraw.Draw(img)
        
        # Draw a simple tree shape
        trunk_color = '#8B4513'
        draw.rectangle([180, 300, 220, 380], fill=trunk_color)
        
        # Leaves (circles)
        leaf_color = '#228B22'
        draw.ellipse([120, 150, 280, 310], fill=leaf_color)
        draw.ellipse([140, 120, 260, 240], fill=leaf_color)
        draw.ellipse([160, 180, 240, 260], fill=leaf_color)
        
        # Add text
        try:
            font = ImageFont.load_default()
        except:
            font = None
        
        text = f'Tree #{tree_id}'
        if font:
            draw.text((150, 50), text, fill='white', font=font)
            draw.text((120, 350), species_name[:15], fill='white', font=font)
        else:
            draw.text((150, 50), text, fill='white')
            draw.text((120, 350), species_name[:15], fill='white')
        
        # Convert to bytes
        img_io = io.BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        
        return ContentFile(img_io.getvalue(), name=f'tree_{tree_id}_{random.randint(1000,9999)}.png')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌳 Adding new tree(s)...'))
        
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
        
        created_trees = []
        
        for i in range(options['count']):
            # Generate coordinates
            latitude = options['latitude'] if options['latitude'] else random.uniform(-90, 90)
            longitude = options['longitude'] if options['longitude'] else random.uniform(-180, 180)
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
            
            # Create and save image
            image = self.create_tree_image(tree.id, species.common_name)
            tree.image.save(image.name, image, save=True)
            
            created_trees.append(tree)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Created Tree ID: {tree.id} at ({latitude:.2f}, {longitude:.2f})'
                )
            )
        
        # Mint if requested
        if options['mint']:
            self.stdout.write(self.style.WARNING('🚀 Starting minting process...'))
            try:
                from replant import nft
                nft.mint_scheduled_nfts()
                
                # Check results
                for tree in created_trees:
                    tree.refresh_from_db()
                    if tree.minting_state == Tree.MintingState.MINTED:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✅ Tree {tree.id} minted as NFT {tree.nft_id}! TX: {tree.nft_mint_tx}'
                            )
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
            self.style.SUCCESS(
                f'🎉 Successfully created {len(created_trees)} tree(s)!'
            )
        )
