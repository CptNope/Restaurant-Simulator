import type {
  SimulationState,
  GuestParty,
  StaffTask,
  TableObject,
  KitchenTicket,
  KitchenMetrics
} from './types';
import { findPath } from './pathfinding';

export const TICK_MINUTES = 0.25;

function getArrivalRatePerHour(state: SimulationState): number {
  const scenario = state.scenario;
  if (!scenario) return 6;
  if (scenario.isTutorial) return 0;

  const t = Math.min(1, Math.max(0, state.time / scenario.durationMinutes));
  const bell = Math.exp(-Math.pow((t - 0.5) / 0.22, 2)) * 0.9 + 0.1;
  const base = scenario.arrivalBaselinePerHour;
  const peak = scenario.arrivalPeakPerHour;
  const range = peak - base;
  return base + range * bell;
}

export function spawnGuests(state: SimulationState, dtMinutes: number): SimulationState {
  if (state.scenario?.isTutorial) {
    return state;
  }

  const arrivalsPerHour = getArrivalRatePerHour(state);
  const expectedArrivalsThisTick = (arrivalsPerHour * dtMinutes) / 60;
  const spawnCount =
    expectedArrivalsThisTick > 0.5
      ? Math.floor(expectedArrivalsThisTick + Math.random())
      : Math.random() < expectedArrivalsThisTick
      ? 1
      : 0;

  let newState = { ...state };

  for (let i = 0; i < spawnCount; i++) {
    const id = `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const partySize = 2 + Math.floor(Math.random() * 3);
    const newGuest: GuestParty = {
      id,
      partySize,
      patience: 15,
      satisfaction: 100,
      state: 'waitingForSeat',
      timeInState: 0,
      arrivalTime: newState.time
    };
    newState = {
      ...newState,
      guests: [...newState.guests, newGuest],
      events: [
        ...newState.events,
        {
          id: `ev-${id}`,
          time: newState.time,
          message: `New party of ${partySize} arrived.`
        }
      ]
    };
  }

  return newState;
}

export function seatWaitingGuests(state: SimulationState): SimulationState {
  const availableTables = state.layout.objects.filter(
    (o) => o.type === 'table'
  ) as TableObject[];

  const guests = state.guests.map((g) => ({ ...g }));
  const tablesOccupied = new Set(
    guests.filter((g) => g.tableId).map((g) => g.tableId as string)
  );

  for (const guest of guests) {
    if (guest.state !== 'waitingForSeat') continue;

    const table = availableTables.find(
      (t) => t.capacity >= guest.partySize && !tablesOccupied.has(t.id)
    );
    if (!table) continue;

    guest.tableId = table.id;
    guest.state = 'seatedWaitingGreet';
    guest.timeInState = 0;

    tablesOccupied.add(table.id);

    state.events.push({
      id: `ev-seat-${guest.id}-${state.time}`,
      time: state.time,
      message: `Party ${guest.id} seated at ${table.label ?? table.id}.`
    });
  }

  return { ...state, guests };
}

export function generateTasks(state: SimulationState): SimulationState {
  const tasks: StaffTask[] = (state.staffTasks ?? []).map((t) => ({ ...t }));
  const guests = state.guests;

  const upsertTask = (task: StaffTask) => {
    if (!tasks.some((t) => t.id === task.id)) {
      tasks.push(task);
    }
  };

  for (const g of guests) {
    if (!g.tableId) continue;

    if (g.state === 'seatedWaitingGreet') {
      const exists = tasks.some(
        (t) => t.type === 'greetTable' && t.guestPartyId === g.id
      );
      if (!exists) {
        upsertTask({
          id: `task-greet-${g.id}`,
          type: 'greetTable',
          tableId: g.tableId,
          guestPartyId: g.id,
          priority: 1,
          createdAt: state.time,
          minDurationMinutes: 1
        });
      }
    }

    if (g.state === 'ordering') {
      const exists = tasks.some(
        (t) => t.type === 'takeOrder' && t.guestPartyId === g.id
      );
      if (!exists) {
        upsertTask({
          id: `task-order-${g.id}`,
          type: 'takeOrder',
          tableId: g.tableId,
          guestPartyId: g.id,
          priority: 2,
          createdAt: state.time,
          minDurationMinutes: 2
        });
      }
    }

    if (g.state === 'waitingForCheck') {
      const exists = tasks.some(
        (t) => t.type === 'dropCheck' && t.guestPartyId === g.id
      );
      if (!exists) {
        upsertTask({
          id: `task-check-${g.id}`,
          type: 'dropCheck',
          tableId: g.tableId,
          guestPartyId: g.id,
          priority: 3,
          createdAt: state.time,
          minDurationMinutes: 1
        });
      }
    }
  }

  return { ...state, staffTasks: tasks };
}

export function assignAndExecuteTasks(
  state: SimulationState,
  dtMinutes: number
): SimulationState {
  const tasks: StaffTask[] = (state.staffTasks ?? []).map((t) => ({ ...t }));
  const staff = state.staff.map((s) => ({ ...s }));
  const guests = state.guests.map((g) => ({ ...g }));

  const servers = staff.filter((s) => s.role === 'server');
  const playerId = state.playerServerId;

  for (const server of servers) {
    if (server.id === playerId) continue;

    const hasActiveTask = tasks.some(
      (t) => t.assignedToStaffId === server.id && !t.completedAt
    );
    if (hasActiveTask) continue;

    const nextTask = tasks
      .filter((t) => !t.assignedToStaffId && !t.completedAt)
      .sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt)[0];

    if (!nextTask) continue;
    nextTask.assignedToStaffId = server.id;

    if (nextTask.tableId && server.x != null && server.y != null) {
      const table = state.layout.objects.find(
        (o) => o.type === 'table' && o.id === nextTask.tableId
      ) as TableObject | undefined;
      if (table && state.layout.walkableGrid) {
        const path = findPath(
          state.layout,
          Math.round(server.x),
          Math.round(server.y),
          table.x,
          table.y
        );
        server.path = path.slice(1);
      }
    }
  }

  for (const task of tasks) {
    if (!task.assignedToStaffId || task.completedAt) continue;

    const server = staff.find((s) => s.id === task.assignedToStaffId);
    if (!server || server.x == null || server.y == null) continue;

    const table = task.tableId
      ? (state.layout.objects.find(
          (o) => o.type === 'table' && o.id === task.tableId
        ) as TableObject | undefined)
      : undefined;
    if (!table) continue;

    const dist = Math.hypot(table.x - server.x, table.y - server.y);
    if (dist > 0.2) continue;

    if (task.startedAt == null) {
      task.startedAt = state.time;
    }

    const minDur = task.minDurationMinutes ?? 0;
    const elapsed = state.time - task.startedAt;
    if (elapsed < minDur) continue;

    task.completedAt = state.time;

    const guest = guests.find((g) => g.id === task.guestPartyId);
    if (!guest) continue;

    switch (task.type) {
      case 'greetTable':
        guest.state = 'ordering';
        guest.timeInState = 0;
        state.events.push({
          id: `ev-greet-${guest.id}-${state.time}`,
          time: state.time,
          message: `Server greeted party ${guest.id}.`
        });
        break;
      case 'takeOrder':
        guest.state = 'waitingForFood';
        guest.timeInState = 0;
        guest.orderTime = state.time;
        state.events.push({
          id: `ev-order-${guest.id}-${state.time}`,
          time: state.time,
          message: `Order taken for party ${guest.id}.`
        });
        break;
      case 'dropCheck':
        guest.state = 'paying';
        guest.timeInState = 0;
        state.events.push({
          id: `ev-check-${guest.id}-${state.time}`,
          time: state.time,
          message: `Check dropped for party ${guest.id}.`
        });
        break;
      case 'cashout':
        guest.state = 'leaving';
        guest.timeInState = 0;
        state.events.push({
          id: `ev-cashout-${guest.id}-${state.time}`,
          time: state.time,
          message: `Party ${guest.id} paid and is leaving.`
        });
        break;
    }
  }

  return { ...state, staff, guests, staffTasks: tasks };
}

export function moveStaffAlongPaths(
  state: SimulationState,
  dtMinutes: number
): SimulationState {
  const staff = state.staff.map((s) => {
    if (s.x == null || s.y == null || !s.path || s.path.length === 0) return s;

    const [nextNode, ...rest] = s.path;
    const dx = nextNode.x - s.x;
    const dy = nextNode.y - s.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxMove = s.speed * dtMinutes;

    if (distance <= maxMove) {
      return { ...s, x: nextNode.x, y: nextNode.y, path: rest };
    }

    const ratio = maxMove / distance;
    const newX = s.x + dx * ratio;
    const newY = s.y + dy * ratio;
    return { ...s, x: newX, y: newY };
  });

  return { ...state, staff };
}

export function updateGuests(
  state: SimulationState,
  dtMinutes: number
): SimulationState {
  const guests = state.guests.map((g) => ({ ...g }));
  const tickets = state.tickets.map((t) => ({ ...t }));
  const km: KitchenMetrics = { ...state.kitchenMetrics };

  for (const g of guests) {
    g.timeInState += dtMinutes;

    if (g.state === 'waitingForSeat' || g.state === 'seatedWaitingGreet') {
      if (g.timeInState > g.patience) {
        g.satisfaction -= 20;
        g.state = 'leaving';
        state.metrics.guestsLeftUnhappy += 1;
        state.events.push({
          id: `ev-leave-wait-${g.id}-${state.time}`,
          time: state.time,
          message: `Party ${g.id} left due to long wait.`
        });
      }
    }

    if (g.state === 'waitingForFood') {
      let ticket = tickets.find((t) => t.guestPartyId === g.id);
      if (!ticket && g.tableId) {
        ticket = {
          id: `ticket-${g.id}`,
          guestPartyId: g.id,
          tableId: g.tableId,
          createdAt: g.orderTime ?? state.time,
          state: 'pending',
          items: []
        };
        tickets.push(ticket);
      }
    }

    if (g.state === 'eating') {
      if (g.timeInState > 20) {
        g.state = 'waitingForCheck';
        g.timeInState = 0;
        state.events.push({
          id: `ev-ready-check-${g.id}-${state.time}`,
          time: state.time,
          message: `Party ${g.id} ready for check.`
        });
      }
    }

    if (g.state === 'paying') {
      if (g.timeInState > 5) {
        g.state = 'leaving';
        g.timeInState = 0;
        state.metrics.revenue += 60;
        state.events.push({
          id: `ev-paid-${g.id}-${state.time}`,
          time: state.time,
          message: `Party ${g.id} paid and is leaving.`
        });
      }
    }

    if (g.state === 'leaving') {
      if (g.timeInState > 3) {
        const idx = state.guests.findIndex((gg) => gg.id === g.id);
        if (idx >= 0) {
          state.guests.splice(idx, 1);
        }
      }
    }
  }

  for (const t of tickets) {
    const age = state.time - t.createdAt;
    if (age > 25 && t.state !== 'delivered') {
      t.state = 'ready';
    } else if (age > 10 && t.state === 'pending') {
      t.state = 'inProgress';
    }
  }

  const completedTickets = tickets.filter((t) => t.state === 'delivered');
  if (completedTickets.length > 0) {
    const totalTicketTime = completedTickets.reduce(
      (acc, t) => acc + (state.time - t.createdAt),
      0
    );
    km.ticketsCompleted += completedTickets.length;
    km.avgTicketTime =
      km.ticketsCompleted > 0
        ? totalTicketTime / km.ticketsCompleted
        : km.avgTicketTime;
  }

  return { ...state, guests, tickets, kitchenMetrics: km };
}
