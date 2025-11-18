import type { Scenario } from './types';

export const FRIDAY_NIGHT_RUSH: Scenario = {
  id: 'friday-night-rush',
  name: 'Friday Night Rush',
  description:
    '6–9pm dinner service with high demand, full staff, and a busy kitchen.',
  durationMinutes: 180,
  arrivalBaselinePerHour: 10,
  arrivalPeakPerHour: 24
};

export const SERVER_TUTORIAL: Scenario = {
  id: 'server-basics-tutorial',
  name: 'First Table – Server Training',
  description:
    'Learn the basic flow: greet, take order, watch the ticket, drop the check, cash out.',
  durationMinutes: 30,
  arrivalBaselinePerHour: 0,
  arrivalPeakPerHour: 0,
  isTutorial: true
};

export const SERVER_TUTORIAL_2: Scenario = {
  id: 'server-two-table-tutorial',
  name: 'Two Tables – Section Management',
  description:
    'Handle two tables at once. Greet, take orders, and manage priorities between T1 and T2.',
  durationMinutes: 40,
  arrivalBaselinePerHour: 0,
  arrivalPeakPerHour: 0,
  isTutorial: true
};

export const SCENARIOS: Scenario[] = [
  SERVER_TUTORIAL,
  SERVER_TUTORIAL_2,
  FRIDAY_NIGHT_RUSH
];
