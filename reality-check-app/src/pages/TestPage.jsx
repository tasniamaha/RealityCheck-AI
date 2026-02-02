import React, { useState } from 'react';

const TestPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <h1>Test Sidebar</h1>
      <button
        onClick={() => {
          console.log('Button clicked, setting sidebarOpen to:', !sidebarOpen);
          setSidebarOpen(!sidebarOpen);
        }}
        style={{ padding: '20px', fontSize: '20px' }}
      >
        Toggle Sidebar
      </button>
      <p>Sidebar is: {sidebarOpen ? 'OPEN' : 'CLOSED'}</p>

      {sidebarOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '300px',
          height: '100vh',
          background: 'white',
          zIndex: 1000,
          padding: '20px'
        }}>
          <h2>Test Sidebar Content</h2>
          <button onClick={() => setSidebarOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default TestPage;