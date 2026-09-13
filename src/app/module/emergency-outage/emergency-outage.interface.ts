export interface ICreateEmergencyOutagePayload {
  feeder_id: string;
  reporter_id: string;
  reason?: string;
  startedAt?: string;
}
