const MeterControls = ({ state, setState }) => {
  const handleChange = ({target}) => setState(prev => ({ ...prev, [target.name]: parseFloat(target.value) }));
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '15px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Min:</label>
          <input
            type="number"
            name="min"
            value={state.min}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Max:</label>
          <input
            type="number"
            name="max"
            value={state.max}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Start Angle:</label>
          <input
            type="number"
            name="startAngle"
            value={state.startAngle}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>End Angle:</label>
          <input
            type="number"
            name="endAngle"
            value={state.endAngle}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MeterControls;