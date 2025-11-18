import React, { useEffect } from 'react';
import { useSimStore } from '../state/simStore';
import { SCENARIOS } from '../sim/scenarios';

export const SimControls: React.FC = () => {
  const { state, tick, setRunning, startFreePlay, startScenario } = useSimStore(
    (s) => ({
      state: s.state,
      tick: s.tick,
      setRunning: s.setRunning,
      startFreePlay: s.startFreePlay,
      startScenario: s.startScenario
    })
  );

  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => {
      tick();
    }, 200);
    return () => clearInterval(id);
  }, [state.running, tick]);

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'free') {
      startFreePlay();
    } else {
      startScenario(val);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        padding: '0.5rem 0'
      }}
    >
      <select
        value={state.scenario ? state.scenario.id : 'free'}
        onChange={handleScenarioChange}
      >
        <option value="free">Free Play</option>
        {SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button onClick={() => setRunning(!state.running)}>
        {state.running ? 'Pause' : 'Play'}
      </button>
      <button onClick={() => tick()} disabled={state.running}>
        Step
      </button>

      <div style={{ marginLeft: '1rem', fontSize: 14 }}>
        Sim time: {state.metrics.elapsedMinutes.toFixed(1)} min
      </div>
      {state.scenario && (
        <div style={{ fontSize: 12 }}>
          Scenario: {state.scenario.name} ({state.time.toFixed(1)} /{' '}
          {state.scenario.durationMinutes} min)
        </div>
      )}
    </div>
  );
};
