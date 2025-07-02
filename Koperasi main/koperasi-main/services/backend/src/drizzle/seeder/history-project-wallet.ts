import { faker } from "@faker-js/faker/locale/id_ID";

export const HistoryProjectWalletData = async (projectIds: string[]) => {
  const data = [
    {
      id: faker.string.uuid(),
      id_project_wallet: projectIds[0],
      nominal: 100000,
      dana_tersisa: 900000,
      deskripsi: "Deskripsi",
      bukti_transfer: "https://example.com/bukti-transfer.jpg",
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_project_wallet: projectIds[1],
      nominal: 200000,
      dana_tersisa: 700000,
      deskripsi: "Deskripsi",
      bukti_transfer: "https://example.com/bukti-transfer.jpg",
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_project_wallet: projectIds[2],
      nominal: 300000,
      dana_tersisa: 400000,
      deskripsi: "Deskripsi",
      bukti_transfer: "https://example.com/bukti-transfer.jpg",
      created_at: new Date(),
    },
  ];

  const usedProjectWalletIds = new Set(data.map((item) => item.id_project_wallet));

  return { data, usedProjectWalletIds };
};
