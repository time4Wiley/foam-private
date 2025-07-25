#!/bin/bash

# Script to publish @time4peter/foam-cli to npm
# Usage: ./scripts/publish-foam-cli.sh [OTP]

set -e

echo "🚀 Publishing @time4peter/foam-cli to npm..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages/foam-cli" ]; then
    echo "❌ Error: This script must be run from the Foam repository root"
    exit 1
fi

# Get OTP from argument or prompt
OTP=$1
if [ -z "$OTP" ]; then
    echo -n "Enter your npm OTP code: "
    read -r OTP
fi

# Validate OTP format (should be 6-8 digits)
if ! [[ "$OTP" =~ ^[0-9]{6,8}$ ]]; then
    echo "❌ Error: Invalid OTP format. Must be 6-8 digits."
    exit 1
fi

# Navigate to foam-cli package
cd packages/foam-cli

# Ensure we have latest dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the package
echo "🔨 Building package..."
yarn build

# Run tests
echo "🧪 Running tests..."
yarn test

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 Current version: $CURRENT_VERSION"

# Publish to npm
echo "📤 Publishing to npm..."
npm publish --otp="$OTP"

if [ $? -eq 0 ]; then
    echo "✅ Successfully published @time4peter/foam-cli@$CURRENT_VERSION to npm!"
    echo "🔗 View at: https://www.npmjs.com/package/@time4peter/foam-cli"
else
    echo "❌ Failed to publish package"
    exit 1
fi

# Return to root
cd ../..

echo "💡 Next steps:"
echo "   - Create a git tag: git tag foam-cli-v$CURRENT_VERSION"
echo "   - Push the tag: git push origin foam-cli-v$CURRENT_VERSION"
echo "   - Update version for next release in packages/foam-cli/package.json"