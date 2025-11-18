import React from 'react';
import { useSimStore } from './state/simStore';
import { SimControls } from './components/SimControls';
import { PlayerController } from './components/PlayerController';
import { PlayerHud } from './components/PlayerHud';
import { TutorialPanel } from './components/TutorialPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { EventLog } from './components/EventLog';
import { StaffPanel } from './components/StaffPanel';
import { TasksPanel } from './components/TasksPanel';
import { TicketsPanel } from './components/TicketsPanel';
import { ScorecardPanel } from './components/Scorecard';
import { FloorplanEditor } from './components/FloorplanEditor';

export const App: React.FC = () => {
  const uiCompact = useSimStore((s) => s.uiCompact);
  const setUiCompact = useSimStore((s) => s.setUiCompact);
  const state = useSimStore((s) => s.state);

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setUiCompact(true);
    }
  }, [setUiCompact]);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0.75rem'
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0'
        }}
      >
        <h1 style={{ fontSize: 18, margin: 0 }}>Restaurant Sim Trainer</h1>
        <label style={{ fontSize: 12 }}>
          <input
            type="checkbox"
            checked={uiCompact}
            onChange={(e) => setUiCompact(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          Compact UI
        </label>
      </header>

      <PlayerController />

      <main>
        <section>
          <h2>Simulation Console</h2>
          <SimControls />
          <PlayerHud />
          <TutorialPanel />
        </section>

        <section style={{ marginTop: '1rem' }}>
          <h3>Floor View</h3>
          <FloorplanEditor />
        </section>

        <section style={{ marginTop: '1rem' }}>
          {!uiCompact && (
            <>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '1rem'
                }}
              >
                <MetricsPanel />
                <EventLog />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '1rem'
                }}
              >
                <StaffPanel />
                <TasksPanel />
                <TicketsPanel />
              </div>
            </>
          )}

          {uiCompact && (
            <div style={{ marginTop: '0.75rem', fontSize: 13 }}>
              <details open>
                <summary>Metrics & Events</summary>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                >
                  <MetricsPanel />
                  <EventLog />
                </div>
              </details>
              <details style={{ marginTop: '0.5rem' }}>
                <summary>Staff & Tasks</summary>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                >
                  <StaffPanel />
                  <TasksPanel />
                </div>
              </details>
              <details style={{ marginTop: '0.5rem' }}>
                <summary>Kitchen Tickets</summary>
                <TicketsPanel />
              </details>
            </div>
          )}
        </section>

        <ScorecardPanel />
      </main>

      <footer
        style={{
          marginTop: '1.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #222',
          fontSize: 11,
          opacity: 0.7
        }}
      >
        Prototype training sim – extend me with deeper heuristics, analytics, and
        multiplayer when you open this project in your editor.
      </footer>
    </div>
  );
};
