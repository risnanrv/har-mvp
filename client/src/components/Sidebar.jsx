// src/components/Sidebar.jsx
import { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const Sidebar = ({ onLoadWebsite }) => {
  const [url, setUrl] = useState('');
  const [loadingWebsite, setLoadingWebsite] = useState(false);
  const [capturingHar, setCapturingHar] = useState(false);
  const API_URL = 'https://har-mvp.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) return;
    
    // Add http:// if not present
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    
    setLoadingWebsite(true);
    await onLoadWebsite(formattedUrl);
    setLoadingWebsite(false);
  };

  const downloadHar = async () => {
    if (!url) {
      alert('Please load a website first');
      return;
    }

    try {
      setCapturingHar(true);
      
      // Format the URL if needed
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
      }
      
      // Request HAR from the server
      const response = await axios.post(`${API_URL}/api/har`, { 
        url: formattedUrl 
      }, {
        responseType: 'blob',
        timeout: 60000 // 60 second timeout
      });
      
      // Check if the response is an error
      if (response.status === 500) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            throw new Error(errorData.details || errorData.error || 'Failed to generate HAR file');
          } catch (e) {
            throw new Error('Failed to generate HAR file');
          }
        };
        reader.readAsText(response.data);
        return;
      }
      
      // Generate a filename based on the URL
      const domain = new URL(formattedUrl).hostname;
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      const filename = `${domain}_${timestamp}.har`;
      
      // Download the file
      saveAs(new Blob([response.data], { type: 'application/json' }), filename);
    } catch (error) {
      console.error('Error downloading HAR:', error);
      if (error.response && error.response.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            alert(errorData.details || errorData.error || 'Failed to download HAR file. Please try again.');
          } catch (e) {
            alert('Failed to download HAR file. Please try again.');
          }
        };
        reader.readAsText(error.response.data);
      } else {
        alert(error.message || 'Failed to download HAR file. Please try again.');
      }
    } finally {
      setCapturingHar(false);
    }
  };

  const handleUploadHar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Here we just confirm the file was selected
    // Actual parsing functionality can be added later
    
    // Reset the file input
    e.target.value = null;
  };

  return (
    <div className="sidebar p-4 w-full md:w-64 lg:w-72 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">HAR Viewer</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
            Input Site URL
          </label>
          <input
            id="url"
            type="text"
            className="input-field"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary w-full"
          disabled={loadingWebsite}
        >
          {loadingWebsite ? 'Loading...' : 'Load Website'}
        </button>
      </form>
      
      <button 
        className="btn bg-green-500 hover:bg-green-600 text-white w-full mb-4"
        onClick={downloadHar}
        disabled={capturingHar}
      >
        {capturingHar ? 'Capturing HAR...' : 'Download HAR'}
      </button>
      
      <label className="btn btn-secondary w-full text-center cursor-pointer">
        Post HAR
        <input 
          type="file" 
          accept=".har" 
          className="hidden" 
          onChange={handleUploadHar} 
        />
      </label>
    </div>
  );
};

export default Sidebar;