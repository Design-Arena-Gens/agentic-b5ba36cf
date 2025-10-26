'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    setStatus('Starting AI agent...');
    setLogs([]);
    setResult(null);

    try {
      addLog('Initiating video generation process');
      setStatus('Generating script...');

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate video');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.status) {
                setStatus(data.status);
                addLog(data.status);
              }

              if (data.result) {
                setResult(data.result);
              }
            }
          }
        }
      }

      addLog('Process completed successfully!');
      setStatus('Complete!');
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>AI Video Agent</h1>
        <p className={styles.description}>
          Generate scripts, enhance them with AI, create videos, and post to YouTube automatically
        </p>

        <div className={styles.inputSection}>
          <input
            type="text"
            placeholder="Enter video topic (e.g., 'Top 5 AI Tools in 2024')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Processing...' : 'Generate & Upload Video'}
          </button>
        </div>

        {status && (
          <div className={styles.status}>
            <h3>Status: {status}</h3>
          </div>
        )}

        {logs.length > 0 && (
          <div className={styles.logs}>
            <h3>Process Logs:</h3>
            <div className={styles.logContent}>
              {logs.map((log, index) => (
                <div key={index} className={styles.logLine}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className={styles.result}>
            <h3>Result:</h3>
            <div className={styles.resultContent}>
              <p><strong>Original Script:</strong></p>
              <p className={styles.script}>{result.originalScript}</p>

              <p><strong>Enhanced Script:</strong></p>
              <p className={styles.script}>{result.enhancedScript}</p>

              {result.videoUrl && (
                <>
                  <p><strong>Video URL:</strong></p>
                  <a href={result.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {result.videoUrl}
                  </a>
                </>
              )}

              {result.youtubeUrl && (
                <>
                  <p><strong>YouTube URL:</strong></p>
                  <a href={result.youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {result.youtubeUrl}
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        <div className={styles.features}>
          <h3>Features:</h3>
          <ul>
            <li>✨ AI-powered script generation using GPT-4</li>
            <li>🚀 Automatic script enhancement for engagement</li>
            <li>🎬 Video generation with text overlays</li>
            <li>📺 Automatic YouTube upload with metadata</li>
            <li>📊 Real-time progress tracking</li>
          </ul>
        </div>

        <div className={styles.setup}>
          <h3>Setup Instructions:</h3>
          <ol>
            <li>Add your OpenAI API key to environment variables</li>
            <li>Configure YouTube API credentials (OAuth 2.0)</li>
            <li>Set up YouTube Data API v3 in Google Cloud Console</li>
            <li>Enter a topic and click the button to start</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
