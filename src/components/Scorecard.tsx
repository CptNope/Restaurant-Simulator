import React from 'react';
import { useSimStore } from '../state/simStore';

export const ScorecardPanel: React.FC = () => {
  const { scorecard, scenarioEnded, scenario } = useSimStore((s) => ({
    scorecard: s.state.scorecard,
    scenarioEnded: s.state.scenarioEnded,
    scenario: s.state.scenario
  }));

  const startScenario = useSimStore((s) => s.startScenario);

  if (!scenarioEnded || !scorecard) return null;

  return (
    <div
      style={{
        border: '1px solid #444',
        padding: '0.75rem',
        marginTop: '1rem',
        background: '#181818',
        fontSize: 14
      }}
    >
      <h3>
        Scenario Complete: {scorecard.scenarioName}{' '}
        <span
          style={{
            marginLeft: 8,
            padding: '0 6px',
            borderRadius: 4,
            border: '1px solid #666'
          }}
        >
          Grade: {scorecard.grade}
        </span>
      </h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginTop: '0.5rem'
        }}
      >
        <div>
          <strong>Guests seated:</strong> {scorecard.guestsSeated}
          <br />
          <strong>Guests left unhappy:</strong> {scorecard.guestsLeftUnhappy}
        </div>
        <div>
          <strong>Avg seat wait:</strong> {scorecard.avgSeatWait.toFixed(1)} min
          <br />
          <strong>Avg ticket time:</strong>{' '}
          {scorecard.avgTicketTime.toFixed(1)} min
        </div>
        <div>
          <strong>Labor cost:</strong> ${scorecard.laborCost.toFixed(2)}
          <br />
          <strong>Revenue:</strong> ${scorecard.revenue.toFixed(2)}
        </div>
      </div>
      {scenario && (
        <button
          style={{ marginTop: '0.75rem' }}
          onClick={() => startScenario(scenario.id)}
        >
          Run {scenario.name} Again
        </button>
      )}
    </div>
  );
};
