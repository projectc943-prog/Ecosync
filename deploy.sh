#!/bin/bash
# Deployment Script for Firebase Hosting + Cloud Run

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration (UPDATE THESE VALUES)
PROJECT_ID="environmental-8b801"
REGION="asia-south1"
SERVICE_NAME="capstone-backend"
FIREBASE_HOSTING_TARGET="production"

# Prompt user to update configuration if needed
echo -e "${BLUE}Current Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo ""
read -p "Continue with these settings? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}Deployment cancelled. Please update the configuration in this script.${NC}"
    exit 1
fi

# Step 1: Build Frontend
echo -e "${BLUE}📦 Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 2: Deploy Backend to Cloud Run
echo -e "${BLUE}🐳 Deploying backend to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --source ./backend \
  --project $PROJECT_ID \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production \
  --max-instances 3 \
  --memory 512Mi \
  --timeout 300

# Get the backend URL
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo -e "${GREEN}✓ Backend deployed to: $BACKEND_URL${NC}"

# Step 3: Update Frontend Environment with Backend URL
echo -e "${BLUE}🔧 Updating frontend configuration...${NC}"
cat > frontend/.env.production << EOF
VITE_API_BASE_URL=$BACKEND_URL
VITE_WS_BASE_URL=${BACKEND_URL/https/wss}
EOF
echo -e "${GREEN}✓ Frontend environment updated${NC}"

# Step 4: Rebuild Frontend with Production URLs
echo -e "${BLUE}📦 Rebuilding frontend with production URLs...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ Frontend rebuilt${NC}"

# Step 5: Deploy to Firebase Hosting
echo -e "${BLUE}🔥 Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting --project $PROJECT_ID

# Get Firebase Hosting URL
HOSTING_URL="https://${PROJECT_ID}.web.app"
echo -e "${GREEN}✓ Frontend deployed to: $HOSTING_URL${NC}"

# Step 6: Update Backend CORS (Manual Step Reminder)
echo ""
echo -e "${BLUE}⚠️  IMPORTANT: Update CORS Configuration${NC}"
echo "  Edit backend/app/main.py and replace:"
echo "    'https://your-project-id.web.app' with 'https://${PROJECT_ID}.web.app'"
echo ""
echo "  Then redeploy the backend:"
echo "    gcloud run deploy $SERVICE_NAME --source ./backend --region $REGION"
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Frontend: $HOSTING_URL"
echo "Backend API: $BACKEND_URL"
echo ""
echo "Next Steps:"
echo "1. Update ESP32 firmware with WebSocket URL: ${BACKEND_URL/https/wss}/ws/data"
echo "2. Update backend CORS settings (see above)"
echo "3. Set up Cloud SQL if using PostgreSQL database"
echo ""
