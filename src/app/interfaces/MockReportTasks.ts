import { SaleTask } from "./SaleTask";

export interface MockReportTasks {
  id: string;
  user: { id: string; name: string };
  pos: { id: string; name: string; retailer: string };
  date: Date;
  tasks: SaleTask[];
}