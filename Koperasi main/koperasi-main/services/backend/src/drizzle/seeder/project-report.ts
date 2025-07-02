import { faker } from "@faker-js/faker/locale/id_ID";
export const projectReportData = async (projectIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    judul: "Laporan Projek Naga 1",
    jenis_laporan: "UNTUNG",
    nominal: 1000000,
    laporan: faker.image.avatar(),
    created_at: new Date("2023-12-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    judul: "Laporan Projek Naga 2",
    jenis_laporan: "RUGI",
    nominal: 2000000,
    laporan: faker.image.avatar(),
    created_at: new Date("2024-03-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    judul: "Laporan Projek Naga 3",
    jenis_laporan: "UNTUNG",
    nominal: 3000000,
    laporan: faker.image.avatar(),
    created_at: new Date("2024-06-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    judul: "Laporan Projek T-Rex 1",
    jenis_laporan: "RUGI",
    nominal: 1200000,
    laporan: faker.image.avatar(),
    created_at: new Date("2023-12-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    judul: "Laporan Projek T-Rex 2",
    jenis_laporan: "UNTUNG",
    nominal: 2000000,
    laporan: faker.image.avatar(),
    created_at: new Date("2024-03-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    judul: "Laporan Projek T-Rex 3",
    jenis_laporan: "RUGI",
    nominal: 400000,
    laporan: faker.image.avatar(),
    created_at: new Date("2024-06-10T13:39:24.000Z"),
  },
];

export const projectReportDataFactory = async (projectIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_projek: faker.helpers.arrayElement(projectIds),
    judul: faker.lorem.sentence(),
    jenis_laporan: faker.helpers.arrayElement(["UNTUNG", "RUGI"]),
    nominal: parseInt(faker.string.numeric({ length: 7 })),
    laporan: faker.image.avatar(),
    created_at: faker.date.recent(),
  }));

  return Promise.all(promises);
};
