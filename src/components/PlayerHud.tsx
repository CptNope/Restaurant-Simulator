import React from 'react';
import { useSimStore } from '../state/simStore';
import type { StaffMember, StaffTask } from '../sim/types';

export const PlayerHud: React.FC = () => {
  const {
    staff,
    playerServerId,
    tasks,
    setPlayerServer,
    playerTakeTask,
    movePlayerByDelta
  } = useSimStore((s) => ({
    staff: s.state.staff,
    playerServerId: s.state.playerServerId,
    tasks: s.state.staffTasks ?? [],
    setPlayerServer: s.setPlayerServer,
    playerTakeTask: s.playerTakeTask,
    movePlayerByDelta: s.movePlayerByDelta
  }));

  const servers = staff.filter((s) => s.role === 'server');
  const player: StaffMember | undefined = staff.find(
    (s) => s.id === playerServerId
  );

  const playerTasks: StaffTask[] = tasks.filter(
    (t) => t.assignedToStaffId === playerServerId && !t.completedAt
  );
  const unassignedTasks: StaffTask[] = tasks.filter(
    (t) => !t.assignedToStaffId && !t.completedAt
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '') setPlayerServer(null);
    else setPlayerServer(val);
  };

  return (
    <div
      style={{
        border: '1px solid #444',
        padding: '0.5rem',
        marginTop: '0.5rem',
        fontSize: 12
      }}
    >
      <h3>Play as Server</h3>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          You are:{' '}
          <select value={playerServerId ?? ''} onChange={handleSelectChange}>
            <option value="">(AI only)</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
        </label>
      </div>

      {player ? (
        <>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Position:</strong>{' '}
            {player.x != null && player.y != null
              ? `${player.x.toFixed(1)}, ${player.y.toFixed(1)}`
              : 'N/A'}{' '}
            <span style={{ marginLeft: 8, opacity: 0.7 }}>
              (WASD / arrows or buttons)
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              marginBottom: '0.5rem'
            }}
          >
            <button
              style={{ width: 40, height: 32 }}
              onClick={() => movePlayerByDelta(0, -1)}
            >
              ▲
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                style={{ width: 40, height: 32 }}
                onClick={() => movePlayerByDelta(-1, 0)}
              >
                ◀
              </button>
              <button
                style={{ width: 40, height: 32 }}
                onClick={() => movePlayerByDelta(0, 1)}
              >
                ▼
              </button>
              <button
                style={{ width: 40, height: 32 }}
                onClick={() => movePlayerByDelta(1, 0)}
              >
                ▶
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Your current task:</strong>{' '}
            {playerTasks[0]
              ? `${playerTasks[0].type} ${
                  playerTasks[0].tableId ? `@ ${playerTasks[0].tableId}` : ''
                }`
              : 'none'}
          </div>

          <div>
            <strong>Available tasks:</strong>
            {unassignedTasks.length === 0 && <div>None right now.</div>}
            {unassignedTasks.length > 0 && (
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {unassignedTasks.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    style={{
                      marginBottom: '0.25rem',
                      padding: '0.25rem',
                      border: '1px solid #333'
                    }}
                  >
                    <div>
                      {t.type} {t.tableId ? `@ ${t.tableId}` : ''} (pri{' '}
                      {t.priority})
                    </div>
                    <button
                      style={{ marginTop: '0.25rem' }}
                      onClick={() => playerTakeTask(t.id)}
                      disabled={!!playerTasks[0]}
                    >
                      Take Task
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <div style={{ opacity: 0.8 }}>
          Choose a server above to control them manually.
        </div>
      )}
    </div>
  );
};
