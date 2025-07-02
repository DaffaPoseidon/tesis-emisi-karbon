import { faker } from "@faker-js/faker/locale/id_ID";

export const ProjectWalletData = async (projectIds: string[]) => {
    const data = [
        {
            id: faker.string.uuid(),
            id_projek: projectIds[0],
            dana_terkumpul: 1000000,
            saldo: 1000000,
            created_at: new Date(),
        },
        {
            id: faker.string.uuid(),
            id_projek: projectIds[1],
            dana_terkumpul: 2000000,
            saldo: 2000000,
            created_at: new Date(),
        },
        {
            id: faker.string.uuid(),
            id_projek: projectIds[2],
            dana_terkumpul: 3000000,
            saldo: 3000000,
            created_at: new Date(),
        },
    ];

    const usedProjectIds = new Set(data.map(item => item.id_projek));

    return { data, usedProjectIds };
};