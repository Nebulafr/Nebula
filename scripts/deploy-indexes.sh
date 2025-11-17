#!/bin/bash

# Deploy Firestore Indexes Script
# This script deploys the Firestore indexes defined in firestore.indexes.json

set -e

echo "🔥 Deploying Firestore Indexes..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please log in:"
    echo "firebase login"
    exit 1
fi

# Check if firestore.indexes.json exists
if [ ! -f "firestore.indexes.json" ]; then
    echo "❌ firestore.indexes.json not found in current directory"
    exit 1
fi

echo "📋 Validating indexes configuration..."
if ! firebase firestore:indexes --help &> /dev/null; then
    echo "❌ Firebase CLI version doesn't support firestore:indexes command"
    echo "Please update Firebase CLI: npm install -g firebase-tools"
    exit 1
fi

echo "🚀 Deploying indexes to Firestore..."
firebase deploy --only firestore:indexes

echo "✅ Firestore indexes deployed successfully!"
echo ""
echo "📊 You can view your indexes at:"
echo "https://console.firebase.google.com/v1/r/project/$(firebase use)/firestore/indexes"
echo ""
echo "⏱️  Note: Index creation can take several minutes to complete."
echo "🔍 Monitor progress in the Firebase Console."