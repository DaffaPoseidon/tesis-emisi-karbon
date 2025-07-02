import { faker } from "@faker-js/faker/locale/id_ID";
export const projectMutationReportData = async (projectIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    judul: "Projek Naga Mutasi 1",
    pemasukan: 1000000,
    pengeluaran: 800000,
    laporan: faker.image.avatar(),
    created_at: new Date('2023-12-10T13:39:24.000Z'),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    judul: "Projek Naga Mutasi 2",
    pemasukan: 2000000,
    pengeluaran: 500000,
    laporan: faker.image.avatar(),
    created_at: new Date('2024-03-10T13:39:24.000Z'),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    judul: "Projek Naga Mutasi 3",
    pemasukan: 3000000,
    pengeluaran: 700000,
    laporan: faker.image.avatar(),
    created_at: new Date('2024-06-10T13:39:24.000Z'),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    judul: "Projek T-Rex Mutasi 1",
    pemasukan: 1200000,
    pengeluaran: 800000,
    laporan: faker.image.avatar(),
    created_at: new Date('2023-12-10T13:39:24.000Z'),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    judul: "Projek T-Rex Mutasi 2",
    pemasukan: 2000000,
    pengeluaran: 900000,
    laporan: faker.image.avatar(),
    created_at: new Date('2024-03-10T13:39:24.000Z'),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    judul: "Projek T-Rex Mutasi 3",
    pemasukan: 400000,
    pengeluaran: 700000,
    laporan: faker.image.avatar(),
    created_at: new Date('2024-06-10T13:39:24.000Z'),
  },
];

export const projectMutationReportDataFactory = async (projectIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_projek: faker.helpers.arrayElement(projectIds),
    judul: faker.lorem.words(),
    pemasukan: parseInt(faker.string.numeric({ length: 7 })),
    pengeluaran: parseInt(faker.string.numeric({ length: 6 })),
    laporan: faker.image.avatar(),
    created_at: new Date(),
  }));
  return Promise.all(promises);
};
