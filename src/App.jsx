import React from 'react';
import ShortenerForm from './components/ShortenerForm';
import './App.css'; // Add some basic styling here

const App = () => {
  return (
    <div className="App">
      <header>
        <h1>URL Shortener</h1>
      </header>
      <main>
        <ShortenerForm />
      </main>
    </div>
  );
};

export default App;