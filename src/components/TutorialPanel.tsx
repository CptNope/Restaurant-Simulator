import React from 'react';
import { useSimStore } from '../state/simStore';
import type { SimulationState, StaffTask, GuestParty } from '../sim/types';

function computeTutorialStep(state: SimulationState): string {
  if (!state.scenario?.isTutorial) return '';

  const scenarioId = state.scenario.id;

  if (scenarioId === 'server-basics-tutorial') {
    const guest: GuestParty | undefined = state.guests[0];
    const tasks: StaffTask[] = state.staffTasks ?? [];
    const tickets = state.tickets;

    if (!guest) {
      return 'Tutorial complete! You served your first table.';
    }

    switch (guest.state) {
      case 'seatedWaitingGreet':
        return 'Tutorial 1 – Step 1: Greet the table at T1.\n\nChoose your server in "Play as Server", tap "Take Task" for the greet task, then move to T1 with the on-screen buttons until the greet completes.';
      case 'ordering':
        return 'Tutorial 1 – Step 2: Take their order.\n\nTake the "takeOrder" task for T1 and move to the table. Stay there until the task finishes.';
      case 'waitingForFood': {
        const ticket = tickets.find((t) => t.guestPartyId === guest.id);
        if (!ticket) {
          return 'Tutorial 1 – Step 3: Kitchen is working.\n\nWatch the Kitchen Tickets panel as your ticket appears and progresses.';
        }
        if (ticket.state === 'pending' || ticket.state === 'inProgress') {
          return 'Tutorial 1 – Step 3: Food is being prepared.\n\nMonitor the ticket for T1. As time passes, it will move to READY.';
        }
        if (ticket.state === 'ready' || ticket.state === 'delivered') {
          return 'Guests are eating.\n\nWhen they are done, they will be ready for the check.';
        }
        return 'Guests are eating and enjoying their meal.';
      }
      case 'eating':
        return 'Guests are eating.\n\nOnce they are finished, they will ask for the check.';
      case 'waitingForCheck':
        return 'Tutorial 1 – Step 4: Drop the check.\n\nTake the "dropCheck" task for T1 and move to the table until the task completes.';
      case 'paying':
        return 'Tutorial 1 – Step 5: Cash them out.\n\nAfter payment, they will leave and the tutorial will end.';
      case 'leaving':
        return 'They are leaving.\n\nOnce they exit, the tutorial scenario will wrap up. You can rerun it or try Tutorial 2 or Friday Night Rush.';
      default:
        return 'Follow the prompts above to continue the tutorial.';
    }
  }

  if (scenarioId === 'server-two-table-tutorial') {
    const guests = state.guests;
    const g1 = guests.find((g) => g.tableId === 't1');
    const g2 = guests.find((g) => g.tableId === 't2');

    const anyWaitingGreet =
      (g1 && g1.state === 'seatedWaitingGreet') ||
      (g2 && g2.state === 'seatedWaitingGreet');

    if (anyWaitingGreet) {
      return 'Tutorial 2 – Step 1: Two tables need greets.\n\nLook at tasks for greetTable @ T1 and T2. Decide who to greet first based on party size and patience.';
    }

    const anyOrdering =
      (g1 && g1.state === 'ordering') || (g2 && g2.state === 'ordering');

    if (anyOrdering) {
      return 'Tutorial 2 – Step 2: Take both orders.\n\nYou will see takeOrder tasks for T1 and T2. Try not to leave either table waiting too long.';
    }

    const anyEating =
      (g1 && (g1.state === 'waitingForFood' || g1.state === 'eating')) ||
      (g2 && (g2.state === 'waitingForFood' || g2.state === 'eating'));

    if (anyEating) {
      return 'Tutorial 2 – Step 3: Watch tickets for both tables.\n\nCheck the Kitchen Tickets panel to see which table’s order is older.';
    }

    const anyWaitingCheck =
      (g1 && g1.state === 'waitingForCheck') ||
      (g2 && g2.state === 'waitingForCheck');

    if (anyWaitingCheck) {
      return 'Tutorial 2 – Step 4: Drop checks efficiently.\n\nYou might have both T1 and T2 wanting checks around the same time.';
    }

    const allGone = !g1 && !g2;
    if (allGone) {
      return 'Tutorial 2 complete! You managed two tables in your section.\n\nNow try Friday Night Rush to see how this scales under load.';
    }

    return 'Tutorial 2 – Keep juggling T1 and T2.\n\nWatch states and tasks for both tables and try to keep waits short and satisfaction high.';
  }

  return 'Tutorial mode active. Follow the table states and tasks to complete the scenario.';
}

export const TutorialPanel: React.FC = () => {
  const state = useSimStore((s) => s.state);
  if (!state.scenario?.isTutorial) return null;

  const msg = computeTutorialStep(state);
  if (!msg) return null;

  return (
    <div
      style={{
        border: '1px solid #555',
        padding: '0.5rem',
        marginTop: '0.5rem',
        background: '#151515',
        fontSize: 13,
        whiteSpace: 'pre-wrap'
      }}
    >
      <h3>Tutorial Guide</h3>
      <div>{msg}</div>
    </div>
  );
};
