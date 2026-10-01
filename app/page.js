'use client';

import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim() || !question.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, question }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'The chat request failed.');
      }
      setResponse(data.content || 'No response received.');
    } catch (err) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #edf8f7 0%, #e9f1ff 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          padding: '2rem',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 18px 45px rgba(15, 76, 90, 0.12)',
          border: '1px solid rgba(21, 92, 104, 0.08)',
        }}
      >
        <h1 style={{ margin: '0 0 0.75rem', fontSize: '2.2rem', color: '#164e63', textAlign: 'center' }}>
          COURSE COMPANION
        </h1>
        <p style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: '#2d4f59', textAlign: 'center' }}>
          Choose a topic and ask a question to get started.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label htmlFor="topic" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#244b58' }}>
              Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic..."
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.8rem 0.9rem',
                fontSize: '1rem',
                borderRadius: '12px',
                border: '1px solid #bfd6d8',
                background: '#f8fbfb',
                color: '#16363f',
              }}
            />
          </div>

          <div>
            <label htmlFor="question" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#244b58' }}>
              Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.8rem 0.9rem',
                fontSize: '1rem',
                borderRadius: '12px',
                border: '1px solid #bfd6d8',
                background: '#f8fbfb',
                color: '#16363f',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem 1rem',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0f766e, #1d4f6f)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 12px 22px rgba(15, 118, 110, 0.18)',
            }}
          >
            {loading ? 'Thinking...' : 'Ask a question'}
          </button>
        </form>

        {response && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.1rem',
              background: '#dce9e6',
              color: '#1f2d2f',
              borderRadius: '12px',
              border: '1px solid rgba(20, 84, 91, 0.08)',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
            }}
          >
            {response}
          </div>
        )}
      </div>
    </main>
  );
}
