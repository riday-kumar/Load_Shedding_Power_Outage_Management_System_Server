export interface INationalLevelElectricity {
  date: string;
  generatedPowerMW: number;
  demand: number;
}

export interface ICreatePowerDistribution {
  expected_need: number;
  allocated: number;
  distributor_id: string;
}
