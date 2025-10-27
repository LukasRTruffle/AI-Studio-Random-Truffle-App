#!/bin/bash

# Auth0 Setup Script
# Installs required dependencies for Auth0 integration

set -e

echo "🔐 Setting up Auth0 authentication..."
echo ""

# Frontend dependencies
echo "📦 Installing frontend Auth0 dependencies..."
cd apps/web
pnpm add @auth0/nextjs-auth0
echo "✅ Frontend dependencies installed"
echo ""

# Backend dependencies
echo "📦 Installing backend Auth0 dependencies..."
cd ../../services/api
pnpm add jsonwebtoken jwks-rsa
pnpm add -D @types/jsonwebtoken
echo "✅ Backend dependencies installed"
echo ""

echo "🎉 Auth0 setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Auth0 account at https://auth0.com/signup"
echo "2. Follow AUTH0_SETUP.md to configure"
echo "3. Add credentials to .env files"
echo "4. Run dev servers: pnpm --filter @random-truffle/web dev (frontend) and pnpm --filter @random-truffle/api dev (backend)"
echo ""
