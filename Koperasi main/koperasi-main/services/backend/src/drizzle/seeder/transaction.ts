import { faker } from "@faker-js/faker/locale/id_ID";

export const TransactionData = async (projectIds: string[], userIds: string[]) => [
  {
    id: "6b0005e5-0ae4-4691-b019-e88b7241b34b",
    id_user: userIds[1],
    nama_user: "John Doe",
    id_projek: projectIds[2],
    judul_projek: "Projek Naga",
    owner_projek: "Budiono Siregar",
    jumlah_token: 10,
    total_nominal: 1000000,
    created_at: new Date(),
  },
  {
    id: "77b41ce9-fb75-4e05-9276-e97e0ebee6d1",
    id_user: userIds[1],
    nama_user: "Rudi Doe",
    id_projek: projectIds[2],
    judul_projek: "Projek T-Rex",
    owner_projek: "Budi Siregar",
    jumlah_token: 20,
    total_nominal: 2000000,
    created_at: new Date(),
  },
  {
    id: "8f9de48b-cfdb-4f33-8494-64418b0935de",
    id_user: userIds[1],
    nama_user: "John Doe",
    id_projek: projectIds[2],
    judul_projek: "Projek Naga",
    owner_projek: "Budiono Siregar",
    jumlah_token: 30,
    total_nominal: 3000000,
    created_at: new Date(),
  }
];
