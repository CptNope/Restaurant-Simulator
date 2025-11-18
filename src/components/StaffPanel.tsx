import React from 'react';
import { useSimStore } from '../state/simStore';
import type { StaffTask } from '../sim/types';

export const StaffPanel: React.FC = () => {
  const { staff, tasks } = useSimStore((s) => ({
    staff: s.state.staff,
    tasks: s.state.staffTasks ?? []
  }));

  const getCurrentTaskForStaff = (staffId: string): StaffTask | undefined =>
    tasks
      .filter((t) => t.assignedToStaffId === staffId && !t.completedAt)
      .sort((a, b) => a.createdAt - b.createdAt)[0];

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
      <h3>Staff</h3>
      {staff.map((s) => {
        const task = getCurrentTaskForStaff(s.id);
        return (
          <div
            key={s.id}
            style={{
              padding: '0.25rem 0',
              borderBottom: '1px solid #222'
            }}
          >
            <div>
              <strong>{s.name}</strong> ({s.role})
            </div>
            <div>
              Pos: {s.x?.toFixed(1) ?? '?'} , {s.y?.toFixed(1) ?? '?'}
            </div>
            <div>
              Task:{' '}
              {task
                ? `${task.type} ${task.tableId ? `@ ${task.tableId}` : ''}`
                : 'idle'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
