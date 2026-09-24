'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Something went wrong!</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      {error.stack && (
        <details style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: '#f5f5f5', 
          borderRadius: '4px',
          maxWidth: '800px',
          textAlign: 'left'
        }}>
          <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Error details</summary>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            fontSize: '12px',
            color: '#333'
          }}>
            {error.stack}
          </pre>
        </details>
      )}
      <button
        onClick={reset}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Try again
      </button>
    </div>
  );
}

