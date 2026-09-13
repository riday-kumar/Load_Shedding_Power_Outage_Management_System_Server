export interface createSubstationPayload {
  station_name: string;
  distributor_id: string;
}

export interface createPowerOperatorPayload {
  name: string;
  email: string;
  address: string;
  password: string;
  substation_id: string;
}

export interface ISubstationPowerDistribution {
  substation_id: string;
  expectedNeed: number;
  allocatedNeed: number;
}

export interface ICreateFeederPayload {
  feeder_name: string;
  area: string;
  substation_id: string;
}

export interface createTechnicianPayload {
  name: string;
  email: string;
  address: string;
  password: string;
  skill: string;
  substationId: string;
}
