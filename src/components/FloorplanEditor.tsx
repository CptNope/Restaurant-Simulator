import React, { useEffect, useState } from 'react';
import { useSimStore } from '../state/simStore';
import type { StationType } from '../sim/types';

type Tool = 'table' | 'host' | 'serverStation' | 'kitchen';

export const FloorplanEditor: React.FC = () => {
  const layout = useSimStore((s) => s.state.layout);
  const staff = useSimStore((s) => s.state.staff);
  const playerServerId = useSimStore((s) => s.state.playerServerId);
  const [tool, setTool] = useState<Tool>('table');

  const player = staff.find((s) => s.id === playerServerId);

  const handleCellClick = (x: number, y: number) => {
    console.log('Clicked cell', x, y, 'tool', tool);
  };

  const renderCell = (x: number, y: number) => {
    const obj = layout.objects.find((o) => o.x === x && o.y === y);
    let content = '';

    if (obj) {
      if (obj.type === 'table') content = 'T';
      if (obj.type === 'station') {
        if (obj.stationType === 'host') content = 'H';
        else if (obj.stationType === 'kitchen') content = 'K';
        else if (obj.stationType === 'pos') content = 'P';
        else content = obj.stationType[0].toUpperCase();
      }
    }

    if (
      player &&
      Math.round(player.x ?? -999) === x &&
      Math.round(player.y ?? -999) === y
    ) {
      content = 'S';
    }

    return (
      <div
        key={`${x}-${y}`}
        id={`cell-${x}-${y}`}
        onClick={() => handleCellClick(x, y)}
        style={{
          width: 24,
          height: 24,
          border: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          cursor: 'pointer'
        }}
      >
        {content}
      </div>
    );
  };

  const rows = [];
  for (let y = 0; y < layout.height; y++) {
    const row = [];
    for (let x = 0; x < layout.width; x++) {
      row.push(renderCell(x, y));
    }
    rows.push(
      <div key={y} style={{ display: 'flex' }}>
        {row}
      </div>
    );
  }

  useEffect(() => {
    if (!player || player.x == null || player.y == null) return;
    const cx = Math.round(player.x);
    const cy = Math.round(player.y);
    const el = document.getElementById(`cell-${cx}-${cy}`);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [player?.x, player?.y]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 8 }}>
        <span style={{ fontSize: 12 }}>Tool:</span>
        <button onClick={() => setTool('table')} disabled={tool === 'table'}>
          Table
        </button>
        <button onClick={() => setTool('host')} disabled={tool === 'host'}>
          Host Stand
        </button>
        <button
          onClick={() => setTool('serverStation')}
          disabled={tool === 'serverStation'}
        >
          POS Station
        </button>
        <button
          onClick={() => setTool('kitchen')}
          disabled={tool === 'kitchen'}
        >
          Kitchen
        </button>
      </div>
      <div
        style={{
          fontSize: 12,
          marginBottom: 8
        }}
      >
        Grid size: {layout.width} x {layout.height}
      </div>
      <div
        style={{
          maxHeight: 260,
          maxWidth: '100%',
          overflow: 'auto',
          border: '1px solid #333'
        }}
      >
        {rows}
      </div>
    </div>
  );
};
