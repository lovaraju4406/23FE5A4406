import React, { useState, useEffect, useRef } from 'react';

// You would replace this with your actual logging function.
const logError = (error) => {
  console.error("Application Error:", error);
};

const Header = () => (
  <header className="py-12 text-center">
    <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight mb-4">
      URL Shortener
    </h1>
    <p className="text-xl text-gray-600 font-light">
      A simple, modern URL shortening service.
    </p>
  </header>
);

const ShortenerForm = () => {
  const [longUrl, setLongUrl] = useState('');
  const [customShortId, setCustomShortId] = useState('');
  const [validity, setValidity] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      new URL(longUrl);
    } catch (e) {
      setError('Please enter a valid URL.');
      setLoading(false);
      logError('Invalid URL entered by user.');
      return;
    }

    const existingShortUrls = JSON.parse(localStorage.getItem('shortUrls') || '[]');
    const finalShortId = customShortId.trim() || Math.random().toString(36).substring(2, 8);

    // Check if URL is already shortened with any ID
    const existingEntryByLongUrl = existingShortUrls.find(entry => entry.longUrl === longUrl);
    if (existingEntryByLongUrl) {
      setShortUrl(existingEntryByLongUrl.shortUrl);
      setLoading(false);
      return;
    }

    // Check if the custom short ID is already in use
    const existingEntryByShortId = existingShortUrls.find(entry => entry.shortId === finalShortId);
    if (existingEntryByShortId) {
      setError(`The custom name '${finalShortId}' is already taken. Please choose another.`);
      setLoading(false);
      return;
    }

    const newShortUrl = `https://${window.location.host}/#/${finalShortId}`;
    const validityMinutes = parseInt(validity) || 30; // Default to 30 minutes
    const expiresAt = new Date().getTime() + validityMinutes * 60 * 1000;
    
    try {
      const updatedShortUrls = [...existingShortUrls, {
        longUrl,
        shortUrl: newShortUrl,
        shortId: finalShortId,
        expiresAt
      }];
      localStorage.setItem('shortUrls', JSON.stringify(updatedShortUrls));
      setShortUrl(newShortUrl);
    } catch (err) {
      logError("Local storage write failed:", err);
      setError('Failed to shorten URL. Please try again.');
      setShortUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
      <form onSubmit={handleShorten} className="space-y-6">
        <input
          type="url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Enter a long URL here"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-800"
          required
          disabled={loading}
        />
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 whitespace-nowrap">
            https://{window.location.host}/#
          </span>
          <input
            type="text"
            value={customShortId}
            onChange={(e) => setCustomShortId(e.target.value)}
            placeholder="custom-name (optional)"
            className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-800"
            disabled={loading}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            placeholder="Validity in minutes (default: 30)"
            className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-800"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-center text-red-600 font-medium">
          {error}
        </p>
      )}

      {shortUrl && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Shortened URL:
          </label>
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={shortUrl}
              readOnly
              className="flex-1 p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
            />
            <button
              onClick={handleCopy}
              className="bg-green-600 text-white font-semibold p-4 rounded-lg shadow-md hover:bg-green-700 transition duration-200 ease-in-out"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const shortId = window.location.hash.slice(2);
      if (shortId) {
        const existingShortUrls = JSON.parse(localStorage.getItem('shortUrls') || '[]');
        const entry = existingShortUrls.find(item => item.shortId === shortId);
        
        if (entry) {
          const currentTime = new Date().getTime();
          if (currentTime <= entry.expiresAt) {
            setRedirectTo(entry.longUrl);
          } else {
            setRedirectTo(null); // URL has expired
            // You can also display a message here
          }
        } else {
          setRedirectTo(null); // Short ID not found
        }
      } else {
        setRedirectTo(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on initial load

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (redirectTo) {
    window.location.href = redirectTo;
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Header />
      <ShortenerForm />
    </div>
  );
}
