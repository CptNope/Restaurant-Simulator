import type {
  SimulationState,
  RestaurantLayout,
  MenuItem,
  Scenario,
  SimMetrics,
  KitchenMetrics,
  Scorecard
} from './types';
import {
  FRIDAY_NIGHT_RUSH,
  SERVER_TUTORIAL,
  SERVER_TUTORIAL_2
} from './scenarios';
import {
  TICK_MINUTES,
  spawnGuests,
  seatWaitingGuests,
  generateTasks,
  assignAndExecuteTasks,
  moveStaffAlongPaths,
  updateGuests
} from './heuristics';

function buildWalkableGrid(layout: RestaurantLayout): boolean[][] {
  const grid: boolean[][] = [];
  for (let y = 0; y < layout.height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < layout.width; x++) {
      const wallHere = layout.objects.some(
        (o) => o.type === 'wall' && o.x === x && o.y === y
      );
      row.push(!wallHere);
    }
    grid.push(row);
  }
  return grid;
}

const FRIDAY_MENU: MenuItem[] = [
  {
    id: 'calamari',
    name: 'Fried Calamari',
    category: 'app',
    price: 15,
    prepTimeMinutes: 8,
    stations: ['fry'],
    complexity: 3
  },
  {
    id: 'burrata',
    name: 'Burrata & Tomatoes',
    category: 'app',
    price: 14,
    prepTimeMinutes: 6,
    stations: ['pantry'],
    complexity: 2
  },
  {
    id: 'steak',
    name: 'Grilled Ribeye',
    category: 'entree',
    price: 34,
    prepTimeMinutes: 16,
    stations: ['grill'],
    complexity: 4
  },
  {
    id: 'pasta',
    name: 'Pappardelle Bolognese',
    category: 'entree',
    price: 26,
    prepTimeMinutes: 14,
    stations: ['saute'],
    complexity: 4
  },
  {
    id: 'branzino',
    name: 'Roasted Branzino',
    category: 'entree',
    price: 32,
    prepTimeMinutes: 18,
    stations: ['saute'],
    complexity: 5
  },
  {
    id: 'cheesecake',
    name: 'Ricotta Cheesecake',
    category: 'dessert',
    price: 11,
    prepTimeMinutes: 5,
    stations: ['pastry'],
    complexity: 2
  },
  {
    id: 'spritz',
    name: 'Aperol Spritz',
    category: 'drink',
    price: 13,
    prepTimeMinutes: 3,
    stations: ['bar'],
    complexity: 1
  }
];

const STARTER_MENU: MenuItem[] = [
  {
    id: 'burger',
    name: 'House Burger',
    category: 'entree',
    price: 18,
    prepTimeMinutes: 12,
    stations: ['grill'],
    complexity: 2
  }
];

export function createInitialState(scenario?: Scenario): SimulationState {
  if (scenario?.id === SERVER_TUTORIAL.id) {
    const layout: RestaurantLayout = {
      width: 12,
      height: 8,
      objects: [
        { id: 't1', type: 'table', x: 6, y: 4, capacity: 4, label: 'T1' },
        { id: 'host1', type: 'station', x: 2, y: 2, stationType: 'host', label: 'Host' },
        { id: 'k1', type: 'station', x: 9, y: 2, stationType: 'kitchen', label: 'Kitchen' },
        { id: 'expo', type: 'station', x: 8, y: 3, stationType: 'expo', label: 'Expo' }
      ],
      hostSpawn: { x: 2, y: 2 },
      guestEntrance: { x: 0, y: 2 },
      walkableGrid: []
    };
    layout.walkableGrid = buildWalkableGrid(layout);

    const menu = FRIDAY_MENU;

    const server = {
      id: 'server1',
      name: 'You (Trainee)',
      role: 'server' as const,
      speed: 4,
      multitaskSkill: 0.7,
      friendliness: 0.95,
      wagePerHour: 7.5,
      shiftStart: 0,
      shiftEnd: scenario.durationMinutes,
      fatigue: 0,
      x: 5,
      y: 5
    };

    const host = {
      id: 'host1',
      name: 'Trainer Host',
      role: 'host' as const,
      speed: 3,
      multitaskSkill: 0.8,
      friendliness: 0.98,
      wagePerHour: 8,
      shiftStart: 0,
      shiftEnd: scenario.durationMinutes,
      fatigue: 0,
      x: 2,
      y: 2
    };

    const tutorialGuest = {
      id: 'party1',
      partySize: 2,
      patience: 20,
      satisfaction: 100,
      state: 'seatedWaitingGreet' as const,
      timeInState: 0,
      arrivalTime: 0,
      tableId: 't1'
    };

    return {
      time: 0,
      layout,
      staff: [server, host],
      guests: [tutorialGuest],
      menu,
      tickets: [],
      metrics: {
        elapsedMinutes: 0,
        guestsSeated: 1,
        guestsLeftUnhappy: 0,
        avgSeatWait: 0,
        avgOrderToFood: 0,
        laborCost: 0,
        revenue: 0
      },
      kitchenMetrics: {
        ticketsCompleted: 0,
        avgTicketTime: 0
      },
      events: [
        {
          id: 'ev-tutorial-start',
          time: 0,
          message:
            'Tutorial 1: greet your first table at T1. Use the controls to move and the HUD to take tasks.'
        }
      ],
      running: false,
      scenario,
      scenarioEnded: false,
      scorecard: undefined,
      playerServerId: server.id,
      staffTasks: []
    };
  }

  if (scenario?.id === SERVER_TUTORIAL_2.id) {
    const layout: RestaurantLayout = {
      width: 14,
      height: 9,
      objects: [
        { id: 't1', type: 'table', x: 5, y: 4, capacity: 4, label: 'T1' },
        { id: 't2', type: 'table', x: 9, y: 4, capacity: 4, label: 'T2' },
        { id: 'host1', type: 'station', x: 2, y: 2, stationType: 'host', label: 'Host' },
        { id: 'k1', type: 'station', x: 11, y: 2, stationType: 'kitchen', label: 'Kitchen' },
        { id: 'expo', type: 'station', x: 10, y: 3, stationType: 'expo', label: 'Expo' }
      ],
      hostSpawn: { x: 2, y: 2 },
      guestEntrance: { x: 0, y: 2 },
      walkableGrid: []
    };
    layout.walkableGrid = buildWalkableGrid(layout);

    const menu = FRIDAY_MENU;

    const server = {
      id: 'server1',
      name: 'You (Trainee)',
      role: 'server' as const,
      speed: 4,
      multitaskSkill: 0.75,
      friendliness: 0.95,
      wagePerHour: 7.5,
      shiftStart: 0,
      shiftEnd: scenario.durationMinutes,
      fatigue: 0,
      x: 7,
      y: 6
    };

    const host = {
      id: 'host1',
      name: 'Trainer Host',
      role: 'host' as const,
      speed: 3,
      multitaskSkill: 0.8,
      friendliness: 0.98,
      wagePerHour: 8,
      shiftStart: 0,
      shiftEnd: scenario.durationMinutes,
      fatigue: 0,
      x: 2,
      y: 2
    };

    const party1 = {
      id: 'party1',
      partySize: 2,
      patience: 20,
      satisfaction: 100,
      state: 'seatedWaitingGreet' as const,
      timeInState: 0,
      arrivalTime: 0,
      tableId: 't1'
    };

    const party2 = {
      id: 'party2',
      partySize: 4,
      patience: 18,
      satisfaction: 100,
      state: 'seatedWaitingGreet' as const,
      timeInState: 0,
      arrivalTime: 2,
      tableId: 't2'
    };

    return {
      time: 0,
      layout,
      staff: [server, host],
      guests: [party1, party2],
      menu,
      tickets: [],
      metrics: {
        elapsedMinutes: 0,
        guestsSeated: 2,
        guestsLeftUnhappy: 0,
        avgSeatWait: 0,
        avgOrderToFood: 0,
        laborCost: 0,
        revenue: 0
      },
      kitchenMetrics: {
        ticketsCompleted: 0,
        avgTicketTime: 0
      },
      events: [
        {
          id: 'ev-tutorial2-start',
          time: 0,
          message:
            'Tutorial 2: Two tables (T1 & T2) in your section. Greet and serve both, managing who to prioritize.'
        }
      ],
      running: false,
      scenario,
      scenarioEnded: false,
      scorecard: undefined,
      playerServerId: server.id,
      staffTasks: []
    };
  }

  const isFriday = scenario?.id === FRIDAY_NIGHT_RUSH.id;

  const baseLayout: RestaurantLayout = isFriday
    ? {
        width: 24,
        height: 14,
        objects: [
          { id: 't1', type: 'table', x: 6, y: 4, capacity: 4, label: 'T1' },
          { id: 't2', type: 'table', x: 9, y: 4, capacity: 4, label: 'T2' },
          { id: 't3', type: 'table', x: 12, y: 4, capacity: 4, label: 'T3' },
          { id: 't4', type: 'table', x: 15, y: 4, capacity: 4, label: 'T4' },
          { id: 't5', type: 'table', x: 6, y: 7, capacity: 4, label: 'T5' },
          { id: 't6', type: 'table', x: 9, y: 7, capacity: 4, label: 'T6' },
          { id: 't7', type: 'table', x: 12, y: 7, capacity: 4, label: 'T7' },
          { id: 't8', type: 'table', x: 15, y: 7, capacity: 4, label: 'T8' },
          { id: 'bar', type: 'station', x: 3, y: 3, stationType: 'bar', label: 'Bar' },
          { id: 'host1', type: 'station', x: 2, y: 2, stationType: 'host', label: 'Host' },
          { id: 'expo', type: 'station', x: 18, y: 3, stationType: 'expo', label: 'Expo' },
          { id: 'k1', type: 'station', x: 20, y: 2, stationType: 'kitchen', label: 'Kitchen' },
          { id: 'pos1', type: 'station', x: 4, y: 6, stationType: 'pos', label: 'POS 1' },
          { id: 'pos2', type: 'station', x: 17, y: 6, stationType: 'pos', label: 'POS 2' }
        ],
        hostSpawn: { x: 2, y: 2 },
        guestEntrance: { x: 0, y: 2 },
        walkableGrid: []
      }
    : {
        width: 20,
        height: 12,
        objects: [
          { id: 't1', type: 'table', x: 5, y: 4, capacity: 4, label: 'T1' },
          { id: 't2', type: 'table', x: 8, y: 4, capacity: 4, label: 'T2' },
          { id: 't3', type: 'table', x: 11, y: 4, capacity: 4, label: 'T3' },
          { id: 'host1', type: 'station', x: 2, y: 2, stationType: 'host', label: 'Host' }
        ],
        hostSpawn: { x: 2, y: 2 },
        guestEntrance: { x: 0, y: 0 },
        walkableGrid: []
      };

  baseLayout.walkableGrid = buildWalkableGrid(baseLayout);

  const menu = isFriday ? FRIDAY_MENU : STARTER_MENU;

  const staff = isFriday
    ? [
        {
          id: 'server1',
          name: 'Alex',
          role: 'server' as const,
          speed: 4,
          multitaskSkill: 0.8,
          friendliness: 0.9,
          wagePerHour: 7.5,
          shiftStart: 0,
          shiftEnd: scenario?.durationMinutes ?? 180,
          fatigue: 0,
          x: 4,
          y: 6
        },
        {
          id: 'server2',
          name: 'Jordan',
          role: 'server' as const,
          speed: 4.2,
          multitaskSkill: 0.85,
          friendliness: 0.88,
          wagePerHour: 7.5,
          shiftStart: 0,
          shiftEnd: scenario?.durationMinutes ?? 180,
          fatigue: 0,
          x: 17,
          y: 6
        },
        {
          id: 'server3',
          name: 'Sam',
          role: 'server' as const,
          speed: 3.8,
          multitaskSkill: 0.75,
          friendliness: 0.92,
          wagePerHour: 7.5,
          shiftStart: 0,
          shiftEnd: scenario?.durationMinutes ?? 180,
          fatigue: 0,
          x: 10,
          y: 4
        },
        {
          id: 'bartender1',
          name: 'Riley',
          role: 'bartender' as const,
          speed: 4,
          multitaskSkill: 0.9,
          friendliness: 0.95,
          wagePerHour: 10,
          shiftStart: 0,
          shiftEnd: scenario?.durationMinutes ?? 180,
          fatigue: 0,
          x: 3,
          y: 3
        },
        {
          id: 'host1',
          name: 'Taylor',
          role: 'host' as const,
          speed: 3,
          multitaskSkill: 0.7,
          friendliness: 0.98,
          wagePerHour: 8,
          shiftStart: 0,
          shiftEnd: scenario?.durationMinutes ?? 180,
          fatigue: 0,
          x: 2,
          y: 2
        },
        {
          id: 'expo1',
          name: 'Morgan',
          role: 'runner' as const,
          speed: 4.5,
          multitaskSkill: 0.8,
          friendliness: 0.85,
          wagePerHour: 8,
          shiftStart: 0,
          shiftEnd: scenario?.durationMinutes ?? 180,
          fatigue: 0,
          x: 18,
          y: 3
        }
      ]
    : [
        {
          id: 'server1',
          name: 'Alex',
          role: 'server' as const,
          speed: 4,
          multitaskSkill: 0.7,
          friendliness: 0.9,
          wagePerHour: 7.5,
          shiftStart: 0,
          shiftEnd: 240,
          fatigue: 0,
          x: 6,
          y: 4
        },
        {
          id: 'host1',
          name: 'Taylor',
          role: 'host' as const,
          speed: 3,
          multitaskSkill: 0.6,
          friendliness: 0.95,
          wagePerHour: 8,
          shiftStart: 0,
          shiftEnd: 240,
          fatigue: 0,
          x: 2,
          y: 2
        }
      ];

  const metrics: SimMetrics = {
    elapsedMinutes: 0,
    guestsSeated: 0,
    guestsLeftUnhappy: 0,
    avgSeatWait: 0,
    avgOrderToFood: 0,
    laborCost: 0,
    revenue: 0
  };

  const kitchenMetrics: KitchenMetrics = {
    ticketsCompleted: 0,
    avgTicketTime: 0
  };

  return {
    time: 0,
    layout: baseLayout,
    staff,
    guests: [],
    menu,
    tickets: [],
    metrics,
    kitchenMetrics,
    events: [],
    running: false,
    scenario,
    scenarioEnded: false,
    scorecard: undefined,
    playerServerId: undefined,
    staffTasks: []
  };
}

function gradeScenario(
  scenario: Scenario,
  metrics: SimMetrics,
  kitchen: KitchenMetrics
): Scorecard['grade'] {
  const { avgSeatWait, guestsLeftUnhappy } = metrics;
  const { avgTicketTime } = kitchen;

  let score = 0;

  if (avgSeatWait < 5) score += 2;
  else if (avgSeatWait < 8) score += 1;
  else if (avgSeatWait > 15) score -= 1;

  if (avgTicketTime < 15) score += 2;
  else if (avgTicketTime < 20) score += 1;
  else if (avgTicketTime > 30) score -= 1;

  if (guestsLeftUnhappy === 0) score += 2;
  else if (guestsLeftUnhappy <= 3) score += 1;
  else if (guestsLeftUnhappy > 8) score -= 2;

  if (score >= 5) return 'S';
  if (score === 4) return 'A';
  if (score === 3) return 'B';
  if (score === 2) return 'C';
  if (score === 1) return 'D';
  return 'F';
}

function checkScenarioEnd(state: SimulationState): SimulationState {
  const scenario = state.scenario;
  if (!scenario) return state;
  if (state.scenarioEnded) return state;

  if (state.time < scenario.durationMinutes) {
    return state;
  }

  state.running = false;
  state.scenarioEnded = true;

  const m = state.metrics;
  const km = state.kitchenMetrics;

  const scorecard: Scorecard = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    finalTime: state.time,
    guestsSeated: m.guestsSeated,
    guestsLeftUnhappy: m.guestsLeftUnhappy,
    avgSeatWait: m.avgSeatWait,
    avgTicketTime: km.avgTicketTime,
    laborCost: m.laborCost,
    revenue: m.revenue,
    grade: gradeScenario(scenario, m, km)
  };

  state.scorecard = scorecard;

  state.events.push({
    id: `ev-scenario-end-${scenario.id}-${state.time}`,
    time: state.time,
    message: `Scenario "${scenario.name}" complete. Grade: ${scorecard.grade}.`
  });

  return state;
}

export function stepSimulation(prev: SimulationState): SimulationState {
  let state: SimulationState = { ...prev };
  const dt = TICK_MINUTES;

  if (!state.running) return state;

  state.time += dt;
  state.metrics.elapsedMinutes = state.time;

  state = spawnGuests(state, dt);
  state = seatWaitingGuests(state);
  state = generateTasks(state);
  state = assignAndExecuteTasks(state, dt);
  state = moveStaffAlongPaths(state, dt);
  state = updateGuests(state, dt);

  state = checkScenarioEnd(state);

  return state;
}
