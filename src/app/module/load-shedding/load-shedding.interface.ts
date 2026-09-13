export interface ICreateLoadShedding {
  feeder_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  plannedLoadShedding: number;
}
