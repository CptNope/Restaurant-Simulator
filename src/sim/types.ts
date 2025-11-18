export type StaffRole = 'server' | 'host' | 'bartender' | 'runner';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  arrivalBaselinePerHour: number;
  arrivalPeakPerHour: number;
  isTutorial?: boolean;
}

export type TicketState = 'pending' | 'inProgress' | 'ready' | 'delivered';

export interface MenuItem {
  id: string;
  name: string;
  category: 'app' | 'entree' | 'dessert' | 'drink';
  price: number;
  prepTimeMinutes: number;
  stations: string[];
  complexity: number;
}

export interface KitchenTicketItem {
  id: string;
  menuItemId: string;
  completedAt?: number;
}

export interface KitchenTicket {
  id: string;
  guestPartyId: string;
  tableId: string;
  createdAt: number;
  state: TicketState;
  items: KitchenTicketItem[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  speed: number;
  multitaskSkill: number;
  friendliness: number;
  wagePerHour?: number;
  shiftStart?: number;
  shiftEnd?: number;
  fatigue?: number;
  x?: number;
  y?: number;
  path?: { x: number; y: number }[];
}

export type GuestState =
  | 'waitingForSeat'
  | 'seatedWaitingGreet'
  | 'ordering'
  | 'waitingForFood'
  | 'eating'
  | 'waitingForCheck'
  | 'paying'
  | 'leaving';

export interface GuestParty {
  id: string;
  partySize: number;
  patience: number;
  satisfaction: number;
  state: GuestState;
  timeInState: number;
  arrivalTime: number;
  tableId?: string;
  orderTime?: number;
}

export interface SimMetrics {
  elapsedMinutes: number;
  guestsSeated: number;
  guestsLeftUnhappy: number;
  avgSeatWait: number;
  avgOrderToFood: number;
  laborCost: number;
  revenue: number;
}

export interface KitchenMetrics {
  ticketsCompleted: number;
  avgTicketTime: number;
}

export interface SimEvent {
  id: string;
  time: number;
  message: string;
}

export type TaskType = 'greetTable' | 'takeOrder' | 'dropCheck' | 'cashout';

export interface StaffTask {
  id: string;
  type: TaskType;
  tableId?: string;
  guestPartyId?: string;
  ticketId?: string;
  priority: number;
  createdAt: number;
  assignedToStaffId?: string;
  completedAt?: number;
  startedAt?: number;
  minDurationMinutes?: number;
}

export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface Scorecard {
  scenarioId?: string;
  scenarioName?: string;
  finalTime: number;
  guestsSeated: number;
  guestsLeftUnhappy: number;
  avgSeatWait: number;
  avgTicketTime: number;
  laborCost: number;
  revenue: number;
  grade: ScoreGrade;
}

export interface FloorObjectBase {
  id: string;
  x: number;
  y: number;
}

export interface TableObject extends FloorObjectBase {
  type: 'table';
  capacity: number;
  label?: string;
}

export type StationType = 'host' | 'kitchen' | 'bar' | 'pos' | 'expo';

export interface StationObject extends FloorObjectBase {
  type: 'station';
  stationType: StationType;
  label?: string;
}

export interface WallObject extends FloorObjectBase {
  type: 'wall';
}

export type FloorObject = TableObject | StationObject | WallObject;

export interface RestaurantLayout {
  width: number;
  height: number;
  objects: FloorObject[];
  hostSpawn?: { x: number; y: number };
  guestEntrance?: { x: number; y: number };
  walkableGrid?: boolean[][];
}

export interface SimulationState {
  time: number;
  layout: RestaurantLayout;
  staff: StaffMember[];
  guests: GuestParty[];
  menu: MenuItem[];
  tickets: KitchenTicket[];
  metrics: SimMetrics;
  kitchenMetrics: KitchenMetrics;
  events: SimEvent[];
  running: boolean;
  scenario?: Scenario;
  scenarioEnded?: boolean;
  scorecard?: Scorecard;
  playerServerId?: string;
  staffTasks?: StaffTask[];
}
