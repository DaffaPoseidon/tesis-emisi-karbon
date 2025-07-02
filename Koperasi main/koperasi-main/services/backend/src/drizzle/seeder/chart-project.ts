import { faker } from "@faker-js/faker/locale/id_ID";
export const chartProjectData = async (projectIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    nominal: 200000,
    created_at: new Date("2023-12-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    nominal: 1500000,
    created_at: new Date("2024-03-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    nominal: 2300000,
    created_at: new Date("2024-06-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    nominal: 400000,
    created_at: new Date("2023-12-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    nominal: 1100000,
    created_at: new Date("2024-03-10T13:39:24.000Z"),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    nominal: -300000,
    created_at: new Date("2024-06-10T13:39:24.000Z"),
  },
];

export const chartProjectDataFactory = async (projectIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_projek: faker.helpers.arrayElement(projectIds),
    nominal: parseInt(faker.string.numeric({ length: 6 })),
    created_at: faker.date.past(),
  }));
  return Promise.all(promises);
};
