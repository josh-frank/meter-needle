const MeterControls = ({ state, setState }) => {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Value: {state.value}
        </label>
        <input
          type="range"
          min={state.min}
          max={state.max}
          value={state.value}
          onChange={(e) => setState(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Min:</label>
          <input
            type="number"
            value={state.min}
            onChange={(e) => setState(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Max:</label>
          <input
            type="number"
            value={state.max}
            onChange={(e) => setState(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Start Angle:</label>
          <input
            type="number"
            value={state.startAngle}
            onChange={(e) => setState(prev => ({ ...prev, startAngle: parseFloat(e.target.value) }))}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>End Angle:</label>
          <input
            type="number"
            value={state.endAngle}
            onChange={(e) => setState(prev => ({ ...prev, endAngle: parseFloat(e.target.value) }))}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MeterControls;