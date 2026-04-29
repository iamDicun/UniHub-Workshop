import React, { useEffect, useState } from 'react';
import { checkHealth } from './api/client.js';

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(data => setHealth(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>UniHub Workshop</h1>
      <div>
        <h2>API Status</h2>
        {health ? (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default App;
