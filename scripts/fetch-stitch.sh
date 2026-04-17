#!/bin/bash
# Fetches a file from a URL (following redirects) and saves it to a destination path.
# Usage: bash scripts/fetch-stitch.sh "<url>" "<destination>"
URL="$1"
DEST="$2"
curl -L --silent --show-error --output "$DEST" "$URL"
echo "Saved to $DEST"
