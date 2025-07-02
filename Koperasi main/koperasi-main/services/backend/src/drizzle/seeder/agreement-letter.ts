import { faker } from "@faker-js/faker/locale/id_ID";
export const agreementLetterData = async (userIds: string[], projectIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    id_user: userIds[0],
    nama_proyek: "Proyek peternakan naga",
    nama_petugas: "Ali Murrofid",
    alamat_petugas: "Ki. Ruecker no 9",
    nama_pemilik_proyek: "alimurrofid",
    nik: "3501234567890123",
    no_hp: "6281234567890",
    alamat: "Jl. Raya Tlogomas No. 246",
    tanda_tangan: "https://coursius.com/storage/images/thumb/2021_04_08_12_24_32_b46a6b4bb45b6863c78df7e2524b48ae_900x450_thumb.jpg",
    nominal_disetujui: 10000000,
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    id_user: userIds[1],
    nama_proyek: "Proyek Jual Beli T-Rex",
    nama_petugas: "Ali Murrofid",
    alamat_petugas: "Ki. Ruecker no 9",
    nama_pemilik_proyek: "budi santoso",
    nik: "3501234567890124",
    no_hp: "6281234567891",
    alamat: "Jl. Darmo No. 10",
    tanda_tangan: "https://coursius.com/storage/images/thumb/2021_04_08_12_24_32_b46a6b4bb45b6863c78df7e2524b48ae_900x450_thumb.jpg",
    nominal_disetujui: 20000000,
    created_at: new Date(),
  },
];

export const agreementLetterDataFactory = async (userIds: string[], projectIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_projek: faker.helpers.arrayElement(projectIds),
    id_user: faker.helpers.arrayElement(userIds),
    nama_proyek: faker.lorem.words(),
    nama_petugas: "Ali Murrofid",
    alamat_petugas: "Ki. Ruecker no 9",
    nama_pemilik_proyek: faker.person.fullName(),
    nik: faker.string.numeric({ length: 16 }),
    no_hp: `62${faker.string.numeric(11)}`,
    alamat: faker.location.streetAddress(),
    tanda_tangan: faker.image.avatar(),
    nominal_disetujui: parseInt(faker.string.numeric({ length: 8 })),
    created_at: new Date(),
  }));
  return Promise.all(promises);
};
