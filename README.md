# Instagram Lite - GitHub Copilot SDLC Demo

A simple Instagram clone built to demonstrate GitHub Copilot's capabilities across the Software Development Lifecycle.

## Features
- ✅ User authentication (login/signup)
- ✅ Photo feed with real-time likes
- ✅ Post creation with image upload
- ✅ User profiles
- ✅ Comments on posts
- ✨ **NEW**: AI-powered image caption generation with hashtags


## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite
- **Auth**: JWT + bcrypt
- **AI**: OpenAI GPT-4o-mini Vision API

## Installation

1. Clone or create the project structure
2. Install all dependencies:
   ```powershell
   npm run install:all
   ```

3. **Configure Environment Variables** (Required for AI Caption Generation):
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit `server/.env` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   ```
   
   > **Get your OpenAI API key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) to create an API key.

4. Start the development servers:
   ```bash
   npm run dev
   ```

This will start both the backend server (on port 5000) and the frontend client (on port 5173).

## AI Caption Generation Feature

### Overview
The AI-powered caption generation feature uses OpenAI's GPT-4o-mini Vision API to automatically generate engaging Instagram captions with relevant hashtags based on the image content.

### How It Works
1. **Upload an Image**: When creating a new post, select an image to upload
2. **Generate Captions**: Click the "Generate Captions" button to get AI-powered suggestions
3. **Choose & Edit**: Select from 3 caption suggestions, each with 3-5 relevant hashtags
4. **Customize**: Edit the selected caption as needed before posting
5. **Post**: Share your image with the perfect caption!

### Features
- ✨ 3 unique caption suggestions per image
- 🏷️ Automatic hashtag generation (3-5 relevant tags)
- ⚡ Fast generation (typically <3 seconds)
- ✏️ Full editing capability before posting
- 🔄 Regenerate captions if you want different options
- 🛡️ Error handling with user-friendly messages

### API Endpoints

#### Generate Caption
```
POST /api/posts/generate-caption
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- image: File (JPEG, PNG, GIF, WebP)

Response:
{
  "success": true,
  "captions": [
    "Caption 1 with #hashtags",
    "Caption 2 with #hashtags",
    "Caption 3 with #hashtags"
  ],
  "message": "Captions generated successfully"
}
```

#### Create Post
```
POST /api/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- image: File
- caption: String

Response:
{
  "id": 1,
  "imageUrl": "/uploads/...",
  "caption": "Your caption"
}
```

### Configuration

The AI caption feature requires an OpenAI API key. Configure it in `server/.env`:

```bash
OPENAI_API_KEY=sk-...
```

**Without an API key**, the feature will gracefully degrade:
- The server will start normally
- Other features will work as expected
- Caption generation will return a helpful error message

### Technical Details

- **Model**: GPT-4o-mini with vision capabilities
- **Image Processing**: Base64 encoding for API transmission
- **File Size Limit**: 10MB per image
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Response Time**: Typically 1-3 seconds
- **Error Handling**: Comprehensive error messages for common issues

### Troubleshooting

**"Caption generation service is not available"**
- Ensure `OPENAI_API_KEY` is set in `server/.env`
- Restart the server after adding the API key

**"Rate limit exceeded"**
- You've hit the OpenAI API rate limit
- Wait a few moments and try again
- Consider upgrading your OpenAI plan for higher limits

**"File size too large"**
- Image must be under 10MB
- Compress or resize your image before uploading

## Development

### Running Tests
```bash
cd server
npm test
```

### Building for Production
```bash
# Build client
cd client
npm run build

# Build server
cd server
npm run build
```

## License
MIT
