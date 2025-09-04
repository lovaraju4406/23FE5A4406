import React from 'react';
import Header from './components/Header'; // Import the Header component
import ShortenerForm from './components/ShortenerForm';
import './App.css'; 

const App = () => {
  return (
    <div className="App">
      <Header /> {/* Use the Header component here */}
      <main>
        <ShortenerForm />
      </main>
    </div>
  );
};

export default App;