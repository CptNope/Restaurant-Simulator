import React from 'react';
import { useSimStore } from '../state/simStore';

export const EventLog: React.FC = () => {
  const events = useSimStore((s) => s.state.events);

  return (
    <div
      style={{
        border: '1px solid #333',
        padding: '0.5rem',
        fontSize: 12,
        flex: 1,
        minWidth: 260,
        maxHeight: 200,
        overflow: 'auto'
      }}
    >
      <h3>Event Log</h3>
      {events.length === 0 && <div>No events yet.</div>}
      {events
        .slice()
        .reverse()
        .map((e) => (
          <div
            key={e.id}
            style={{
              borderBottom: '1px solid #222',
              padding: '0.25rem 0'
            }}
          >
            <div style={{ opacity: 0.7 }}>{e.time.toFixed(1)} min</div>
            <div>{e.message}</div>
          </div>
        ))}
    </div>
  );
};
