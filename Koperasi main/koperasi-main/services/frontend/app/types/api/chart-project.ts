import type { Proyek } from "./proyek";

export type ChartProjectResponse = {
  id: string;
  project: Proyek;
  nominal: number;
};

export type ChartProjectByUserResponse = {
  month: string;
  year: string;
  sum_nominal: string;
};
