import { useState } from 'react';
import './App.css';
import Meter from './Meter';
import Knob from './Knob';
// import MeterControls from './MeterControls';

function App() {
  const [state, setState] = useState({
    min: 0,
    max: 100,
    value: 50,
  });

  return <>
    <div style={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      transform: 'translate(10, 10)',
      height: '800px',
      width: '800px',
    }}>
      <Meter
        value={state.value}
        min={state.min}
        max={state.max}
        startAngle={-180}
        endAngle={90}
        numMarks={101}
        highlightEveryNth={10}
        viewbox='-45 -45 80 80'
      />
    </div>
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '400px',
      width: '400px',
    }}>
      <Knob
        value={state.value}
        min={state.min}
        max={state.max}
        step={state.step}
        label='Tone arm'
        continuous={false}
        startAngle={-140}
        endAngle={140}
        numMarks={15}
        highlightEveryNth={2}
        setState={setState}
      />
    </div>
    {/* <MeterControls state={state} setState={setState} /> */}
  </>;
}

export default App