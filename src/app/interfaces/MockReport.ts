import { LineupTask } from './LineupTask';

export interface MockReport {
  id: string;
  user: { id: string; name: string };
  pos: { id: string; name: string; retailer: string };
  date: Date;
  tasks: LineupTask[];
}