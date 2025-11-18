import React from 'react';
import { useSimStore } from '../state/simStore';

export const TasksPanel: React.FC = () => {
  const { tasks } = useSimStore((s) => ({
    tasks: s.state.staffTasks ?? []
  }));

  if (tasks.length === 0) {
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
        <h3>Tasks</h3>
        <div>No active tasks.</div>
      </div>
    );
  }

  const sorted = [...tasks].sort(
    (a, b) => a.priority - b.priority || a.createdAt - b.createdAt
  );

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
      <h3>Tasks</h3>
      {sorted.map((t) => (
        <div
          key={t.id}
          style={{
            padding: '0.25rem 0',
            borderBottom: '1px solid #222'
          }}
        >
          <div>
            <strong>{t.type}</strong> {t.tableId && <span>@ {t.tableId}</span>}
          </div>
          <div>
            Pri: {t.priority} | Created: {t.createdAt.toFixed(1)} min
          </div>
          <div>
            Staff:{' '}
            {t.assignedToStaffId ? t.assignedToStaffId : <em>unassigned</em>}
          </div>
          {t.completedAt && (
            <div>Done at: {t.completedAt.toFixed(1)} min</div>
          )}
        </div>
      ))}
    </div>
  );
};
