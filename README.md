# Instagram Lite - GitHub Copilot SDLC Demo

A simple Instagram clone built to demonstrate GitHub Copilot's capabilities across the Software Development Lifecycle.

## Features
- ✅ User authentication (login/signup)
- ✅ Photo feed with real-time likes
- ✅ Post creation with image upload
- ✅ User profiles
- ✅ Comments on posts
- ✅ **AI-Powered Image Caption Generation** - Automatically generate creative captions for your images using OpenAI's Vision API


## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite
- **Auth**: JWT + bcrypt
- **AI**: OpenAI GPT-4o-mini Vision API for image captioning

## Installation

1. Clone or create the project structure
2. Install all dependencies:
   ```powershell
   npm run install:all
   ```
3. Configure environment variables:
   - Copy `server/.env.example` to `server/.env`
   - Add your OpenAI API key to enable AI caption generation
   - Set other required environment variables (JWT_SECRET, PORT)
4. Start the development servers:
   ```powershell
   npm run dev
   ```

## Environment Variables

The following environment variables are required in `server/.env`:

- `PORT` - Server port (default: 5000)
- `OPENAI_API_KEY` - Your OpenAI API key for AI caption generation (get it from [OpenAI Platform](https://platform.openai.com/api-keys))
- `JWT_SECRET` - Secret key for JWT token generation

See `server/.env.example` for a template.

## AI Caption Generation

The AI-powered caption generation feature allows users to:
- Upload an image and automatically receive 3 AI-generated caption suggestions
- Choose from different caption styles (short & catchy, descriptive, with emojis)
- Copy captions to clipboard
- Regenerate new suggestions

**Supported image formats**: JPEG, PNG, GIF, WebP  
**Maximum file size**: 10MB  
**API**: Uses OpenAI's GPT-4o-mini Vision model
