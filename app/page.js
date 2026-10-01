'use client';

import { useEffect, useState } from 'react';

const questionPrompts = [
  'How can I help you today?',
  'What would you like to explore?',
  'What’s on your mind?',
  'Ask me anything...',
  'What can I help you figure out?',
  'Where would you like to start?',
  'What would you like to know?',
];

const headlinePhrases = [
  'Curiosity looks good on you.',
  'Big question energy.',
  'Your brain called. It has a question.',
  'Plot twist: let\'s figure it out.',
  'Let\'s see where this goes.',
  'Ready when your curiosity is.',
];

const initialHistorySections = [
  { label: 'Recent', items: ['Water Cycle', 'Cell Structure', 'World War II'] },
  { label: 'Science', items: ['Biology Notes', 'Earth Systems'] },
  { label: 'History', items: ['American Revolution'] },
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [questionPlaceholder, setQuestionPlaceholder] = useState(questionPrompts[0]);
  const [headline, setHeadline] = useState(headlinePhrases[0]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [historySections, setHistorySections] = useState(initialHistorySections);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    try {
      const savedHistory = window.localStorage.getItem('workhouse-history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        const isValidHistory = Array.isArray(parsedHistory) && parsedHistory.every(
          (section) => typeof section.label === 'string'
            && Array.isArray(section.items)
            && section.items.every((item) => typeof item === 'string'),
        );
        if (isValidHistory) {
          setHistorySections(parsedHistory);
        }
      }
    } catch {}
    setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (historyLoaded) {
      try {
        window.localStorage.setItem('workhouse-history', JSON.stringify(historySections));
      } catch {}
    }
  }, [historySections, historyLoaded]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * questionPrompts.length);
    setQuestionPlaceholder(questionPrompts[randomIndex]);
  }, []);

  useEffect(() => {
    let index = Math.floor(Math.random() * headlinePhrases.length);
    setHeadline(headlinePhrases[index]);

    const intervalId = window.setInterval(() => {
      index = (index + 1) % headlinePhrases.length;
      setHeadline(headlinePhrases[index]);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, []);

  const statusMessages = [
    'Searching the web for reliable sources…',
    'Comparing information across sources…',
    'Checking which sources support an answer…',
    'Formulating the answer…',
    'Double-checking the response…',
    'Almost there…',
    'Polishing the summary…',
    'Weaving the answer together…',
  ];

  function deleteHistoryCategory(label) {
    if (window.confirm(`Delete the "${label}" category and all its conversations?`)) {
      setHistorySections((sections) => sections.filter((section) => section.label !== label));
    }
  }

  function deleteHistoryConversation(sectionLabel, conversation) {
    if (window.confirm(`Delete "${conversation}" from your history?`)) {
      setHistorySections((sections) => sections
        .map((section) => section.label === sectionLabel
          ? { ...section, items: section.items.filter((item) => item !== conversation) }
          : section)
        .filter((section) => section.items.length > 0));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsPressed(true);

    if (!question.trim()) {
      setError('Please enter a question or prompt.');
      setStatusMessage('');
      window.setTimeout(() => setIsPressed(false), 180);
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    formData.append('question', question.trim());

    let ticker = null;
    let index = 0;
    setStatusMessage(statusMessages[0]);
    ticker = window.setInterval(() => {
      index = (index + 1) % statusMessages.length;
      setStatusMessage(statusMessages[index]);
    }, 850);

    try {
      setError('');
      setIsLoading(true);
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'The upload failed.');
      }

      setStatusMessage('Answer ready.');
      setResponse(data);
      window.setTimeout(() => setIsPressed(false), 220);
    } catch (err) {
      setStatusMessage('Something needs attention.');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setResponse(null);
      window.setTimeout(() => setIsPressed(false), 220);
    } finally {
      setIsLoading(false);
      window.clearInterval(ticker);
      window.setTimeout(() => setStatusMessage(''), 1200);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: '#f5f7fb',
        color: '#1f2937',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          minHeight: 760,
          display: 'flex',
          borderRadius: '28px',
          background: '#ffffff',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        <aside
          style={{
            width: 280,
            background: '#f8fafc',
            borderRight: '1px solid #e5e7eb',
            padding: '1rem 0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.6rem 0.9rem',
            }}
          >
            <div style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Workhouse
            </div>
            <button
              type="button"
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '10px',
                border: '1px solid #dbe6ef',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                fontSize: '1.4rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Create new project"
            >
              +
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {historySections.length ? historySections.map((section) => (
              <div key={section.label}>
                <div
                  className="history-category-row"
                  style={{
                    margin: '0.5rem 0.6rem 0.3rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onDoubleClick={() => setDeleteTarget({ type: 'category', label: section.label })}
                >
                  {section.label}
                  {deleteTarget?.type === 'category' && deleteTarget.label === section.label ? (
                    <button
                      type="button"
                      className="history-delete-action"
                      title={`Delete ${section.label} category`}
                      aria-label={`Delete ${section.label} category`}
                      onClick={() => {
                        deleteHistoryCategory(section.label);
                        setDeleteTarget(null);
                      }}
                      style={{ width: '1.8rem', height: '1.8rem', border: '1px solid #fecdd3', borderRadius: '8px', background: '#fff1f2', color: '#9f1239', cursor: 'pointer', fontSize: '0.9rem', placeItems: 'center' }}
                    >
                      <span aria-hidden="true">🗑</span>
                    </button>
                  ) : null}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {section.items.map((item) => (
                    <div key={item} className="history-conversation-row" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        type="button"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          border: 'none',
                          background: item === 'Water Cycle' ? '#e7f7f4' : '#f8fafc',
                          color: '#1f2937',
                          borderRadius: '10px',
                          padding: '0.7rem 0.7rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: item === 'Water Cycle' ? 'inset 0 0 0 1px #bfe8df' : 'none',
                        }}
                        onDoubleClick={() => setDeleteTarget({ type: 'conversation', label: section.label, item })}
                      >
                        {item}
                      </button>
                      {deleteTarget?.type === 'conversation'
                        && deleteTarget.label === section.label
                        && deleteTarget.item === item ? (
                          <button
                            type="button"
                            className="history-delete-action"
                            title={`Delete ${item}`}
                            aria-label={`Delete ${item}`}
                            onClick={() => {
                              deleteHistoryConversation(section.label, item);
                              setDeleteTarget(null);
                            }}
                            style={{ width: '1.8rem', height: '1.8rem', border: '1px solid #fecdd3', borderRadius: '8px', background: '#fff1f2', color: '#9f1239', cursor: 'pointer', fontSize: '0.9rem', placeItems: 'center' }}
                          >
                            <span aria-hidden="true">🗑</span>
                          </button>
                        ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div style={{ padding: '0.7rem', color: '#64748b', fontSize: '0.85rem' }}>
                No saved conversations
              </div>
            )}
          </div>
        </aside>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              background: '#ffffff',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Project
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Water Cycle</div>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.45rem 0.8rem',
                borderRadius: '999px',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              Active topic
            </div>
          </header>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              background: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                gap: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}>
                <span key={headline} className="headline-transition">{headline}</span>
              </div>
              <button
                type="button"
                style={{
                  border: '1px solid #dbe6ef',
                  background: '#fff',
                  color: '#0f172a',
                  borderRadius: '10px',
                  padding: '0.55rem 0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                New file
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '0.8rem 0.9rem',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                }}
              >
                <label
                  htmlFor="topic"
                  style={{
                    width: '2.6rem',
                    height: '2.6rem',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #dff7f1, #e7f0ff)',
                    border: '1px solid #cfe5e6',
                    fontSize: '1.4rem',
                    color: '#0f766e',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  +
                </label>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.2rem' }}>
                    Source document
                  </div>
                  <label htmlFor="topic" style={{ display: 'block', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                    {selectedFile ? selectedFile.name : 'Choose a file (optional)'}
                  </label>
                  <input
                    id="topic"
                    type="file"
                    accept="*/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '0.8rem 0.9rem',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={questionPlaceholder}
                  aria-label="Message"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.85rem 0.9rem',
                    borderRadius: '12px',
                    border: '1px solid #dbe6ef',
                    background: '#f8fafc',
                    fontSize: '1rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  {statusMessage ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.8rem 0.9rem',
                        borderRadius: '12px',
                        background: '#eefaf7',
                        border: '1px solid #bfe8df',
                        color: '#0f5f54',
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: '0.7rem',
                          height: '0.7rem',
                          borderRadius: '50%',
                          background: '#16a34a',
                          display: 'inline-block',
                          animation: 'pulse 1.2s infinite ease-in-out',
                        }}
                      />
                      {statusMessage}
                    </div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  onMouseDown={() => setIsPressed(true)}
                  onMouseUp={() => setIsPressed(false)}
                  onMouseLeave={() => setIsPressed(false)}
                  onClick={handleSubmit}
                  style={{
                    minWidth: 150,
                    padding: '0.9rem 1.1rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '14px',
                    background: isPressed
                      ? 'linear-gradient(135deg, #0f766e, #0b5c66)'
                      : 'linear-gradient(135deg, #0f766e, #1d4f6f)',
                    color: '#ffffff',
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.85 : 1,
                    boxShadow: isPressed
                      ? '0 8px 16px rgba(15, 118, 110, 0.2)'
                      : '0 12px 22px rgba(15, 118, 110, 0.18)',
                    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.12s ease',
                  }}
                  aria-label="Submit your question"
                >
                  {isLoading ? 'Launching…' : isPressed ? 'Launching…' : 'Ask'}
                </button>
              </div>

              {error ? (
                <div
                  style={{
                    padding: '0.8rem 0.9rem',
                    borderRadius: '12px',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#9f1239',
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              ) : null}

              {response ? (
                <div
                  style={{
                    padding: '1rem 1rem 1.2rem',
                    borderRadius: '18px',
                    background: '#ffffff',
                    border: '1px solid #dbe6ef',
                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ marginBottom: '0.6rem', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Answer
                  </div>
                  <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#0f172a', whiteSpace: 'pre-wrap' }}>{response.answer}</div>
                  {response.sources?.length ? (
                    <div style={{ marginTop: '1.1rem', paddingTop: '0.9rem', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        Web sources
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.35rem' }}>
                        {response.sources.map((source) => (
                          <li key={source.id}>
                            <a href={source.url} target="_blank" rel="noreferrer" style={{ color: '#0f766e', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                              [{source.id}] {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .history-delete-action {
          display: none;
        }
        .history-category-row:hover .history-delete-action,
        .history-category-row:focus-within .history-delete-action,
        .history-conversation-row:hover .history-delete-action,
        .history-conversation-row:focus-within .history-delete-action {
          display: grid;
        }
        .headline-transition {
          display: inline-block;
          animation: headline-enter 450ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
        }
        @keyframes headline-enter {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.45; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .headline-transition { animation: none; }
        }
      `}</style>
    </main>
  );
}
