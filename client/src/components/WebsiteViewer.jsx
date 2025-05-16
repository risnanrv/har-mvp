// src/components/WebsiteViewer.jsx
import { useState, useEffect, useRef } from 'react';

const WebsiteViewer = ({ websiteUrl }) => {
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (websiteUrl) {
      setLoading(true);
    }
  }, [websiteUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-lg font-semibold">Loading website...</div>
        </div>
      )}
      
      {websiteUrl ? (
        <iframe
          ref={iframeRef}
          src={websiteUrl}
          className="website-iframe"
          onLoad={handleIframeLoad}
          title="Website Preview"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Website Window</p>
        </div>
      )}
    </div>
  );
};

export default WebsiteViewer;