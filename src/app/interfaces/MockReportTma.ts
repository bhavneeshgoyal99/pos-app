import { TmaTask } from './TmaTask';

export interface MockReportTma {
  id: string;
  user: { id: string; name: string };
  pos: { id: string; name: string; retailer: string };
  date: Date;
  tasks: TmaTask[];
}