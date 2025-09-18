// import Knob from "./Knob";

const MeterControls = ({ state, setState }) => {
  const handleChange = ({target}) => setState(prev => ({ ...prev, [target.name]: parseFloat(target.value) }));
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Value slider - full width */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Value: {state.value}
        </label>
        <input
          type="range"
          name="value"
          min={state.min}
          max={state.max}
          value={state.value}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>

      {/* Value knob */}
      {/* <Knob state={state} setState={setState} /> */}

      {/* Other controls - flexbox wrap */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Min:</label>
          <input
            type="number"
            name="min"
            value={state.min}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Max:</label>
          <input
            type="number"
            name="max"
            value={state.max}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Start Angle:</label>
          <input
            type="number"
            name="startAngle"
            value={state.startAngle}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>End Angle:</label>
          <input
            type="number"
            name="endAngle"
            value={state.endAngle}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Scale Marks:</label>
          <input
            type="number"
            name="numMarks"
            value={state.numMarks}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
            min="5"
            max="200"
          />
        </div>
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Highlight Every:</label>
          <input
            type="number"
            name="highlightEveryNth"
            value={state.highlightEveryNth}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
            min="1"
            max="20"
          />
        </div>
      </div>
    </div>
  );
};

export default MeterControls;