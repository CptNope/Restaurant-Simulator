import React, { useEffect } from 'react';
import { useSimStore } from '../state/simStore';

export const PlayerController: React.FC = () => {
  const movePlayerByDelta = useSimStore((s) => s.movePlayerByDelta);
  const playerServerId = useSimStore((s) => s.state.playerServerId);

  useEffect(() => {
    if (!playerServerId) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          movePlayerByDelta(0, -1);
          break;
        case 's':
        case 'ArrowDown':
          movePlayerByDelta(0, 1);
          break;
        case 'a':
        case 'ArrowLeft':
          movePlayerByDelta(-1, 0);
          break;
        case 'd':
        case 'ArrowRight':
          movePlayerByDelta(1, 0);
          break;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playerServerId, movePlayerByDelta]);

  return null;
};
