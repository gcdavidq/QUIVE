import React from 'react';
import { ThemeProvider } from './ThemeContext';
import QuiveApp from './components/QuiveApp';

function App() {
  return (
    <ThemeProvider>
      <QuiveApp />
    </ThemeProvider>
  );
}

export default App;