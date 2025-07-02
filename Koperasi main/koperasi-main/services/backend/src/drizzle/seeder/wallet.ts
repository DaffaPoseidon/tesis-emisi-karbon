import { faker } from "@faker-js/faker/locale/id_ID";

export const walletData = async (userIds: string[]) => {
  const data = [
    {
      id: faker.string.uuid(),
      id_user: userIds[0],
      jenis_wallet: "SIMPANAN POKOK",
      saldo: 50_000,
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_user: userIds[0],
      jenis_wallet: "SIMPANAN WAJIB",
      saldo: 120_000,
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_user: userIds[1],
      jenis_wallet: "SIMPANAN POKOK",
      saldo: 50_000,
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_user: userIds[1],
      jenis_wallet: "SIMPANAN WAJIB",
      saldo: 120_000,
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_user: userIds[2],
      jenis_wallet: "SIMPANAN POKOK",
      saldo: 50_000,
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_user: userIds[2],
      jenis_wallet: "SIMPANAN WAJIB",
      saldo: 120_000,
      created_at: new Date(),
    },
  ];

  const usedUserIds = new Set(data.map((item) => item.id_user));

  return { data, usedUserIds };
};

export const walletDataFactory = async (userIds: string[], count: number, usedUserIds: Set<string>) => {
  const availableUserIds = userIds.filter((id) => !usedUserIds.has(id));

  const usedIds = new Set<string>();

  const promises = Array.from({ length: count }).map(async () => {
    let selectedUserId: string;

    do {
      selectedUserId = faker.helpers.arrayElement(availableUserIds);
    } while (usedIds.has(selectedUserId));

    usedIds.add(selectedUserId);

    const jenis_wallet = faker.helpers.arrayElement(["SIMPANAN WAJIB", "SIMPANAN POKOK", "SALDO"]);

    let nominal;
    if (jenis_wallet === "SIMPANAN WAJIB") {
      nominal = 50000;
    } else if (jenis_wallet === "SIMPANAN POKOK") {
      nominal = 120000;
    } else {
      nominal = parseInt(faker.string.numeric({ length: 6 }));
    }

    return {
      id: faker.string.uuid(),
      id_user: selectedUserId,
      jenis_wallet,
      saldo: parseInt(faker.string.numeric({ length: 6 })),
      created_at: new Date(),
    };
  });

  return Promise.all(promises);
};
