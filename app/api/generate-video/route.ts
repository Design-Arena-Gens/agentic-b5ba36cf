import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { google } from 'googleapis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-mode',
});

async function generateScript(topic: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-mode') {
    return `Welcome to ${topic}!\n\nIn this video, we'll explore the fascinating world of ${topic}.\n\nFirst, let's understand what makes ${topic} so important in today's world.\n\nNext, we'll dive into the key concepts and practical applications.\n\nFinally, we'll look at future trends and opportunities.\n\nThank you for watching! Don't forget to like and subscribe!`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a professional YouTube script writer. Create engaging, informative scripts for short videos (30-60 seconds).',
      },
      {
        role: 'user',
        content: `Write a short, engaging YouTube video script about: ${topic}. Keep it under 150 words.`,
      },
    ],
    temperature: 0.8,
  });

  return completion.choices[0].message.content || '';
}

async function enhanceScript(originalScript: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-mode') {
    return `🎬 ENHANCED VERSION:\n\n${originalScript}\n\n✨ Remember to engage with us in the comments below!\n🔔 Subscribe for more amazing content!`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at enhancing video scripts to make them more engaging, adding hooks, transitions, and call-to-actions.',
      },
      {
        role: 'user',
        content: `Enhance this video script to make it more engaging and professional:\n\n${originalScript}`,
      },
    ],
    temperature: 0.9,
  });

  return completion.choices[0].message.content || originalScript;
}

async function generateVideoHtml(script: string): Promise<string> {
  const lines = script.split('\n').filter(line => line.trim());
  const wordsPerSlide = 10;
  const words = script.split(' ');
  const slides: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerSlide) {
    slides.push(words.slice(i, i + wordsPerSlide).join(' '));
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
    }
    .slide {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      text-align: center;
      padding: 50px;
      box-sizing: border-box;
    }
    .text {
      color: white;
      font-size: 48px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      max-width: 90%;
      line-height: 1.4;
    }
    .footer {
      position: fixed;
      bottom: 30px;
      width: 100%;
      text-align: center;
      color: rgba(255,255,255,0.8);
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="text" id="content">${slides[0] || script}</div>
  </div>
  <div class="footer">AI Generated Video</div>
  <script>
    const slides = ${JSON.stringify(slides)};
    let currentSlide = 0;
    const contentEl = document.getElementById('content');

    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      contentEl.textContent = slides[currentSlide];
    }, 3000);
  </script>
</body>
</html>
  `;
}

async function uploadToYouTube(videoData: string, title: string, description: string): Promise<string> {
  if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET || !process.env.YOUTUBE_REFRESH_TOKEN) {
    return 'https://youtube.com/watch?v=demo-video-id (YouTube API not configured)';
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });

  // Note: In production, you would need to convert the HTML to actual video
  // For demo purposes, we're returning a placeholder
  return 'https://youtube.com/watch?v=demo-video-id (Video HTML generated, actual upload requires video file)';
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendUpdate = async (status: string, result?: any) => {
    await writer.write(
      encoder.encode(`data: ${JSON.stringify({ status, result })}\n\n`)
    );
  };

  (async () => {
    try {
      const body = await request.json();
      const { topic } = body;

      if (!topic) {
        await sendUpdate('Error: Topic is required');
        await writer.close();
        return;
      }

      await sendUpdate('Generating initial script...');
      const originalScript = await generateScript(topic);

      await sendUpdate('Enhancing script with AI...');
      const enhancedScript = await enhanceScript(originalScript);

      await sendUpdate('Creating video preview HTML...');
      const videoHtml = await generateVideoHtml(enhancedScript);

      await sendUpdate('Preparing for YouTube upload...');
      const youtubeUrl = await uploadToYouTube(
        videoHtml,
        topic,
        enhancedScript
      );

      await sendUpdate('Complete!', {
        originalScript,
        enhancedScript,
        youtubeUrl,
        videoUrl: youtubeUrl,
        videoPreview: videoHtml,
      });

      await writer.close();
    } catch (error: any) {
      await sendUpdate(`Error: ${error.message}`);
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
