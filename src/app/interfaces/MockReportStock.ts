import { StockTask } from './StockTask';

export interface MockReportStock {
  id: string;
  user: { id: string; name: string };
  pos: { id: string; name: string; retailer: string };
  date: Date;
  tasks: StockTask[];
}