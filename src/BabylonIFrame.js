import React from 'react';

const BabylonIframe = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <iframe
        src='/babylon-scene.html'
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Babylon.js Scene"
      ></iframe>
    </div>
  );
};

export default BabylonIframe;
