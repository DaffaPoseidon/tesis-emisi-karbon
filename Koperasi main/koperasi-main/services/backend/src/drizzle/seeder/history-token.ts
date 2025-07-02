import { faker } from "@faker-js/faker/locale/id_ID";
export const historyTokenData = async (chartTokenIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_chart_token: chartTokenIds[0],
    nilai: 300000,
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_chart_token: chartTokenIds[0],
    nilai: 1600000,
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_chart_token: chartTokenIds[0],
    nilai: 2400000,
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_chart_token: chartTokenIds[1],
    nilai: 600000,
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_chart_token: chartTokenIds[1],
    nilai: 1300000,
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_chart_token: chartTokenIds[1],
    nilai: 1000000,
    created_at: new Date(),
  },
];
