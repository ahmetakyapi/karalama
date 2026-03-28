#!/bin/bash
set -e

echo "Building shared package..."
cd packages/shared
npx tsc
cd ../..

echo "Building web app..."
cd apps/web
npx next build
