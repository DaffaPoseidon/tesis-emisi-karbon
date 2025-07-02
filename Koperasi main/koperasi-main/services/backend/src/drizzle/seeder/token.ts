import { faker } from "@faker-js/faker/locale/id_ID";
export const tokenData = async (userIds: string[], count: number) => {
  const promises = Array.from({ length: count }).flatMap(() => [
    {
      id: faker.string.uuid(),
      id_projek: "5310c3ba-8da7-44f6-9c2d-57363b082aee",
      id_user: userIds[1],
      nilai: 1000000,
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_projek: "848fdf64-a0f8-4dc4-8cc3-81678734edca",
      id_user: userIds[1],
      nilai: 2000000,
      created_at: new Date(),
    },
  ]);

  return Promise.all(promises);
};

export const tokenDataFactory = async (userIds: string[], projectIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_projek: faker.helpers.arrayElement(projectIds),
    id_user: faker.helpers.arrayElement(userIds),
    nilai: faker.helpers.arrayElement([1000000, 2000000]),
    created_at: new Date(),
  }));

  return Promise.all(promises);
};
