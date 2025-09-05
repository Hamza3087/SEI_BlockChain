#!/bin/bash

# Auto mint script for Replant World
# This script can be run as a cron job to automatically mint NFTs

# Set the project directory
PROJECT_DIR="/app"

# Log file
LOG_FILE="/tmp/auto_mint.log"

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Change to project directory
cd "$PROJECT_DIR" || {
    log "ERROR: Could not change to project directory"
    exit 1
}

# Check if there are trees to mint
TREES_COUNT=$(docker exec replant-api python manage.py shell -c "from replant.models import Tree; print(Tree.objects.filter(sponsor__isnull=False, review_state='APPROVED').exclude(minting_state='MINTED').count())" 2>/dev/null)

if [ "$TREES_COUNT" -eq 0 ]; then
    log "INFO: No trees to mint"
    exit 0
fi

log "INFO: Found $TREES_COUNT trees to mint"

# Run the auto mint command
log "INFO: Starting automated minting process"
docker exec replant-api python manage.py auto_mint --all

if [ $? -eq 0 ]; then
    log "INFO: Automated minting completed successfully"
else
    log "ERROR: Automated minting failed"
    exit 1
fi 