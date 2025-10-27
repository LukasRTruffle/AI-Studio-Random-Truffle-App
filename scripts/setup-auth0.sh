#!/bin/bash

# Auth0 Setup Script
# Installs required dependencies for Auth0 integration

set -e

echo "🔐 Setting up Auth0 authentication..."
echo ""

# Frontend dependencies
echo "📦 Installing frontend Auth0 dependencies..."
cd apps/web
npm install @auth0/nextjs-auth0
echo "✅ Frontend dependencies installed"
echo ""

# Backend dependencies
echo "📦 Installing backend Auth0 dependencies..."
cd ../../services/api
npm install jsonwebtoken jwks-rsa
npm install --save-dev @types/jsonwebtoken
echo "✅ Backend dependencies installed"
echo ""

echo "🎉 Auth0 setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Auth0 account at https://auth0.com/signup"
echo "2. Follow AUTH0_SETUP.md to configure"
echo "3. Add credentials to .env files"
echo "4. Run 'npm run dev' in both frontend and backend"
echo ""
