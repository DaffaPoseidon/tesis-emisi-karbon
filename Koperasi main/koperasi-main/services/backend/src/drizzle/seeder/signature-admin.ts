import { faker } from "@faker-js/faker/locale/id_ID";
export const SignatureAdminData = async (userIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_user: userIds[0],
    signature: "/uploads/tanda_tangan_admin/1730169870902-ttd.jpeg",
    created_at: new Date(),
  },
];
