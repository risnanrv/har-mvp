// src/App.jsx
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import WebsiteViewer from './components/WebsiteViewer';

function App() {
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleLoadWebsite = (url) => {
    setWebsiteUrl(url);
    return new Promise(resolve => {
      // We'll resolve this promise after a small delay
      // to simulate the loading process
      setTimeout(resolve, 500);
    });
  };

  return (
    <div className="app-container">
      <Sidebar onLoadWebsite={handleLoadWebsite} />
      <div className="flex-1 h-screen overflow-hidden">
        <WebsiteViewer websiteUrl={websiteUrl} />
      </div>
    </div>
  );
}

export default App;