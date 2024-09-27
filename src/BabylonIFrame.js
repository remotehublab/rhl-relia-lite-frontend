import React, { useEffect } from 'react';

const BabylonIframe = ({ fanSpeed }) => {
  const iframeSrc = `./babylon-scene.html?fanSpeed=${fanSpeed}`;

  useEffect(() => {
    console.log(`Iframe loaded with fanSpeed: ${fanSpeed}`);
  }, [fanSpeed]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <iframe
        src={iframeSrc}
        style={{ width: '100%', height: '160%', border: 'none' }}
        title="Babylon.js Scene"
      ></iframe>
    </div>
  );
};

export default BabylonIframe;
