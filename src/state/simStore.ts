import { create } from 'zustand';
import type { SimulationState } from '../sim/types';
import { createInitialState, stepSimulation } from '../sim/engine';
import { SCENARIOS } from '../sim/scenarios';

interface SimStore {
  state: SimulationState;
  tick: () => void;
  reset: () => void;
  setRunning: (running: boolean) => void;
  startFreePlay: () => void;
  startScenario: (scenarioId: string) => void;
  setPlayerServer: (staffId: string | null) => void;
  movePlayerByDelta: (dx: number, dy: number) => void;
  playerTakeTask: (taskId: string) => void;
  uiCompact: boolean;
  setUiCompact: (value: boolean) => void;
}

export const useSimStore = create<SimStore>((set, get) => ({
  state: createInitialState(),
  uiCompact: false,
  setUiCompact: (value) => set({ uiCompact: value }),

  tick: () =>
    set((s) => ({
      state: stepSimulation(s.state)
    })),

  reset: () =>
    set({
      state: createInitialState()
    }),

  setRunning: (running) =>
    set((s) => ({
      state: {
        ...s.state,
        running
      }
    })),

  startFreePlay: () => {
    set({ state: createInitialState(undefined) });
  },

  startScenario: (scenarioId) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    set({ state: createInitialState(scenario) });
    set((s) => ({
      state: {
        ...s.state,
        running: true
      }
    }));
  },

  setPlayerServer: (staffId) =>
    set((s) => ({
      state: {
        ...s.state,
        playerServerId: staffId ?? undefined
      }
    })),

  movePlayerByDelta: (dx, dy) =>
    set((s) => {
      const state = s.state;
      const playerId = state.playerServerId;
      if (!playerId) return s;

      const layout = state.layout;
      const grid = layout.walkableGrid;

      const staff = state.staff.map((st) => {
        if (st.id !== playerId) return st;

        const curX = Math.round(st.x ?? (layout.hostSpawn?.x ?? 0));
        const curY = Math.round(st.y ?? (layout.hostSpawn?.y ?? 0));
        const nx = curX + dx;
        const ny = curY + dy;

        const inBounds =
          nx >= 0 && ny >= 0 && nx < layout.width && ny < layout.height;
        if (!inBounds) return st;

        if (grid && grid[ny] && grid[ny][nx] === false) {
          return st;
        }

        return { ...st, x: nx, y: ny, path: undefined };
      });

      return {
        state: {
          ...state,
          staff
        }
      };
    }),

  playerTakeTask: (taskId) =>
    set((s) => {
      const state = s.state;
      const playerId = state.playerServerId;
      if (!playerId || !state.staffTasks) return s;

      const tasks = state.staffTasks.map((t) =>
        t.id === taskId && !t.completedAt
          ? { ...t, assignedToStaffId: playerId }
          : t
      );

      return {
        state: {
          ...state,
          staffTasks: tasks
        }
      };
    })
}));
