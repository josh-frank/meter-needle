import { useState } from 'react';
import './App.css';
import Meter from './Meter';
import MeterControls from './MeterControls';

function App() {

  const [state, setState] = useState({
    min: 0,
    max: 100,
    value: 50,
    startAngle: -130,
    endAngle: 130,
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Galvanometer Display */}
      <Meter state={state} />

      {/* Controls */}
      <MeterControls state={state} setState={setState} />
    </div>
  );

}

export default App