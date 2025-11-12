import React, { useEffect, useState } from 'react';
import './App.css';
import './theme.css';
import { AppStateProvider, useAppState } from './store/AppState';
import Lobby from './components/Lobby';
import Room from './components/Room';
import Board from './components/Board';

// PUBLIC_INTERFACE
function App() {
  return (
    <AppStateProvider>
      <ThemedRoot />
    </AppStateProvider>
  );
}

function ThemedRoot() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 'auto', paddingBottom: 24 }}>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 style={{ marginTop: 48 }}>Ludo Online</h1>
        <p className="App-link" style={{ marginBottom: 24 }}>
          Ocean Professional Theme
        </p>
      </header>
      <main>
        <MainView />
      </main>
    </div>
  );
}

function MainView() {
  const { state } = useAppState();
  if (state.view === 'room') return <Room />;
  if (state.view === 'board') return <Board />;
  return <Lobby />;
}

export default App;
