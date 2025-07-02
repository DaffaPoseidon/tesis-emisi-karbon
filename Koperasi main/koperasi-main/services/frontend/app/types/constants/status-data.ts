import type { StatusProject } from "./status-project";

export type StatusData = {
  id: string;
  id_proyek: string;
  history: string;
  keterangan: string;
  status: StatusProject;
  created_at: string;
  updated_at: string;
};
