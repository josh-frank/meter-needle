import { useState } from 'react';
import './App.css';
// import Meter from './Meter';
// import MeterControls from './MeterControls';
import ToneArmDemo from './ToneArmDemo';
import KnobDemo from './KnobDemo';
// import GSRMeterApp from './GSRMeterApp';

function App() {
  const [currentView, setCurrentView] = useState('knob');

  // const [state, setState] = useState({
  //   min: 0,
  //   max: 100,
  //   value: 50,
  //   startAngle: -130,
  //   endAngle: 130,
  //   numMarks: 101,
  //   highlightEveryNth: 10,
  // });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Navigation */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '15px'
      }}>
        <button 
          onClick={() => setCurrentView('knob')}
          style={{
            backgroundColor: currentView === 'knob' ? '#4CAF50' : '#f5f5f5',
            color: currentView === 'knob' ? 'white' : '#333',
            border: '1px solid #ccc',
            padding: '10px 20px',
            margin: '0 5px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🎛️ Dev.to Knob
        </button>
        
        <button 
          onClick={() => setCurrentView('tonearm')}
          style={{
            backgroundColor: currentView === 'tonearm' ? '#4CAF50' : '#f5f5f5',
            color: currentView === 'tonearm' ? 'white' : '#333',
            border: '1px solid #ccc',
            padding: '10px 20px',
            margin: '0 5px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📡 Tone Arm
        </button>
      </div>

      {/* Render current view */}
      {currentView === 'knob' && <KnobDemo />}
      {currentView === 'tonearm' && <ToneArmDemo />}
    </div>
  );

}

export default App