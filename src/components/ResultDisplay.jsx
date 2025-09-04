import React from 'react';

const ResultDisplay = ({ shortUrl }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    alert('Copied to clipboard!');
  };

  return (
    <div className="result-container">
      <p>Your shortened URL:</p>
      <div className="result-box">
        <a href={shortUrl} target="_blank" rel="noopener noreferrer">
          {shortUrl}
        </a>
        <button onClick={handleCopy}>Copy</button>
      </div>
    </div>
  );
};

export default ResultDisplay;