import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Patch HTMLMediaElement.prototype.play to gracefully catch and ignore AbortError/Play Interruption warnings
const originalPlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function(this: HTMLMediaElement) {
  const promise = originalPlay.call(this);
  if (promise !== undefined && typeof promise.catch === "function") {
    promise.catch((err: any) => {
      if (err && (err.name === 'AbortError' || (err.message && err.message.includes('interrupted')))) {
        console.info("Prevented uncaught play() interruption error:", err.message || err);
      } else {
        console.warn("HTMLMediaElement.play() failed:", err);
      }
    });
  }
  return promise;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
