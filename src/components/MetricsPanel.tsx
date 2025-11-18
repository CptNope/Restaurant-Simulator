import React from 'react';
import { useSimStore } from '../state/simStore';

export const MetricsPanel: React.FC = () => {
  const { metrics, kitchenMetrics } = useSimStore((s) => ({
    metrics: s.state.metrics,
    kitchenMetrics: s.state.kitchenMetrics
  }));

  return (
    <div
      style={{
        border: '1px solid #333',
        padding: '0.5rem',
        fontSize: 12,
        flex: 1,
        minWidth: 220
      }}
    >
      <h3>Metrics</h3>
      <div>Guests seated: {metrics.guestsSeated}</div>
      <div>Guests left unhappy: {metrics.guestsLeftUnhappy}</div>
      <div>Avg seat wait: {metrics.avgSeatWait.toFixed(1)} min</div>
      <div>Avg order→food: {metrics.avgOrderToFood.toFixed(1)} min</div>
      <div>Labor cost: ${metrics.laborCost.toFixed(2)}</div>
      <div>Revenue: ${metrics.revenue.toFixed(2)}</div>
      <hr />
      <div>Tickets completed: {kitchenMetrics.ticketsCompleted}</div>
      <div>Avg ticket time: {kitchenMetrics.avgTicketTime.toFixed(1)} min</div>
    </div>
  );
};
