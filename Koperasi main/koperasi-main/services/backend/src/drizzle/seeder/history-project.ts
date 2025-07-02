import { faker } from "@faker-js/faker/locale/id_ID";
export const historyProjectData = async (projectIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0],
    history: "Proses Approval dari Komitee Koperasi",
    keterangan:
      "Project disetujui oleh komitee dengan catatan sebagai berikut: <ul><li><strong>Nominal disetujui:</strong> Rp 10000000</li><li><strong>Jumlah Unit:</strong> 10</li><li><strong>Maks Pembelian:</strong> 10 atau Rp 10000000</li></ul>",
    status: "SUCCESS",
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1],
    history: "Proses Approval dari Komitee Koperasi",
    keterangan:
      "Project disetujui oleh komitee dengan catatan sebagai berikut: <ul><li><strong>Nominal disetujui:</strong> Rp 20000000</li><li><strong>Jumlah Unit:</strong> 20</li><li><strong>Maks Pembelian:</strong> 20 atau Rp 20000000</li></ul>",
    status: "SUCCESS",
    created_at: new Date(),
  },
];

export const historyProjectDataFactory = async (projectIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_projek: faker.helpers.arrayElement(projectIds),
    history: faker.lorem.words(),
    keterangan: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(["SUCCESS", "FAILED", "PENDING"]),
    created_at: new Date(),
  }));
  return Promise.all(promises);
};
