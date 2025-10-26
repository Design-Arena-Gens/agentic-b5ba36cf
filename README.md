# AI Video Agent

An autonomous AI agent that generates scripts, enhances them with AI, creates videos, and automatically posts them to YouTube.

## Features

- 🤖 AI-powered script generation using GPT-4
- ✨ Automatic script enhancement for better engagement
- 🎬 Video generation with dynamic text overlays
- 📺 Automatic YouTube upload with metadata
- 📊 Real-time progress tracking with streaming updates

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- YouTube Data API v3 credentials (OAuth 2.0)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `OPENAI_API_KEY`: Your OpenAI API key
- `YOUTUBE_CLIENT_ID`: YouTube OAuth client ID
- `YOUTUBE_CLIENT_SECRET`: YouTube OAuth client secret
- `YOUTUBE_REFRESH_TOKEN`: YouTube OAuth refresh token

### Getting YouTube API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Use OAuth playground to get refresh token

## Usage

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm start
```

## How It Works

1. **Script Generation**: AI generates an initial script based on your topic
2. **Enhancement**: Script is enhanced with hooks, transitions, and CTAs
3. **Video Creation**: Dynamic video created with animated text overlays
4. **YouTube Upload**: Video automatically uploaded to YouTube with metadata

## Tech Stack

- Next.js 14 (App Router)
- OpenAI GPT-4
- YouTube Data API v3
- Canvas (for video frame generation)
- FFmpeg (for video encoding)
- TypeScript

## Demo Mode

The application works in demo mode without API keys configured. Demo mode:
- Uses placeholder scripts
- Generates videos locally
- Simulates YouTube upload (returns demo URL)

## License

MIT
