import React from 'react';
import { useSimStore } from '../state/simStore';

export const TicketsPanel: React.FC = () => {
  const { tickets, menu, time } = useSimStore((s) => ({
    tickets: s.state.tickets,
    menu: s.state.menu,
    time: s.state.time
  }));

  const menuMap = new Map(menu.map((m) => [m.id, m]));

  return (
    <div
      style={{
        border: '1px solid #333',
        padding: '0.5rem',
        fontSize: 12,
        flex: 1,
        minWidth: 260
      }}
    >
      <h3>Kitchen Tickets</h3>
      {tickets.length === 0 && <div>No tickets yet.</div>}
      {tickets.map((t) => {
        const age = time - t.createdAt;
        return (
          <div
            key={t.id}
            style={{
              border: '1px solid #222',
              marginBottom: '0.5rem',
              padding: '0.25rem 0.4rem',
              background:
                t.state === 'ready'
                  ? '#204020'
                  : t.state === 'inProgress'
                  ? '#202040'
                  : '#202020'
            }}
          >
            <div>
              <strong>{t.id}</strong> – Table {t.tableId} – {t.state} –{' '}
              {age.toFixed(1)} min
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {t.items.map((item) => {
                const menuItem = menuMap.get(item.menuItemId);
                return (
                  <li key={item.id}>
                    {menuItem?.name ?? item.menuItemId}{' '}
                    {item.completedAt
                      ? `(done at ${(item.completedAt - t.createdAt).toFixed(
                          1
                        )} min)`
                      : ''}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
