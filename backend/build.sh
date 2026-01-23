#!/usr/bin/env bash
# Exit on error
set -e

echo "Build script started..."
echo "Upgrading pip..."
python -m pip install --upgrade pip

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Build script finished."
