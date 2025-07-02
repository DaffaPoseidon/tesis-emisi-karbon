import { faker } from "@faker-js/faker/locale/id_ID";
export const projectCategoryData = async () => [
  {
    id: "a2269857-dd6e-43bd-9216-f3f617dde418",
    kategori: "Peternakan",
    created_at: new Date(),
  },
  {
    id: "b44a051b-e063-4a30-831b-a7b01aaee620",
    kategori: "Pertanian",
    created_at: new Date(),
  },
  {
    id: "c6480dac-f999-40a0-a468-67974794be17",
    kategori: "Jual Beli",
    created_at: new Date(),
  },
];

export const projectData = async (userIds: string[], categoryIds: string[]) => [
  {
    id: "5310c3ba-8da7-44f6-9c2d-57363b082aee",
    id_user: userIds[0], // Use actual user ID
    id_kategori: categoryIds[0], // Use actual category ID
    judul: "Proyek Peternakan",
    deskripsi: "Proyek peternakan naga",
    nominal: 10000000,
    asset_jaminan: "Tanah",
    nilai_jaminan: 20000000,
    lokasi_usaha: "Malang",
    detail_lokasi: "Jl. Raya Tlogomas No. 246",
    brosur_produk: "https://everpro.id/blog/contoh-brosur-minuman/",
    pendapatan_perbulan: 2000000,
    pengeluaran_perbulan: 500000,
    report_progress: "3",
    dokumen_proyeksi: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm7Ed-GxL_MOmlJj7Zo2pzKtOdS9gKBDHxTA&s",
    status: "APPROVAL",
    nominal_disetujui: 10000000,
    harga_per_unit: 1000000,
    jumlah_koin: 10,
    minimal_pembelian: 1,
    maksimal_pembelian: 10,
    limit_siklus: 3,
    created_at: new Date("2023-05-10T13:39:24.000Z"),
  },
  {
    id: "848fdf64-a0f8-4dc4-8cc3-81678734edca",
    id_user: userIds[0],
    id_kategori: categoryIds[2],
    judul: "Proyek Jual Beli",
    deskripsi: "Proyek Jual Beli T-Rex",
    nominal: 20000000,
    asset_jaminan: "Tanah",
    nilai_jaminan: 40000000,
    lokasi_usaha: "Malang",
    detail_lokasi: "Jl. Raya Tlogomas No. 246",
    brosur_produk: "https://everpro.id/blog/contoh-brosur-minuman/",
    pendapatan_perbulan: 2000000,
    pengeluaran_perbulan: 500000,
    report_progress: "3",
    dokumen_proyeksi: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm7Ed-GxL_MOmlJj7Zo2pzKtOdS9gKBDHxTA&s",
    status: "APPROVAL",
    nominal_disetujui: 20000000,
    harga_per_unit: 1000000,
    jumlah_koin: 20,
    minimal_pembelian: 1,
    maksimal_pembelian: 20,
    limit_siklus: 3,
    created_at: new Date("2023-05-10T13:39:24.000Z"),
  },
];

export const projectDataFactory = async (userIds: string[], categoryIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_user: faker.helpers.arrayElement(userIds), // Use actual user IDs
    id_kategori: faker.helpers.arrayElement(categoryIds), // Use actual category IDs
    judul: faker.lorem.words(),
    deskripsi: faker.lorem.sentence(),
    nominal: parseInt(faker.string.numeric({ length: 8 })),
    asset_jaminan: faker.lorem.word(),
    nilai_jaminan: parseInt(faker.string.numeric({ length: 8 })),
    lokasi_usaha: faker.location.city(),
    detail_lokasi: faker.location.streetAddress(),
    brosur_produk: faker.image.url(),
    pendapatan_perbulan: parseInt(faker.string.numeric({ length: 7 })),
    pengeluaran_perbulan: parseInt(faker.string.numeric({ length: 6 })),
    report_progress: faker.helpers.arrayElement(["1", "3", "6", "12"]),
    dokumen_proyeksi: faker.image.url(),
    status: faker.helpers.arrayElement(["DRAFT", "PROSES VERIFIKASI", "REVISI", "APPROVAL", "TTD KONTRAK", "PENDANAAN DIBUKA"]),
    limit_siklus: 3,
  }));
  return Promise.all(promises);
};

export const supportDocumentData = async (projectIds: string[]) => [
  {
    id: faker.string.uuid(),
    id_projek: projectIds[0], // Use actual project ID
    dokumen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm7Ed-GxL_MOmlJj7Zo2pzKtOdS9gKBDHxTA&s",
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[1], // Use actual project ID
    dokumen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm7Ed-GxL_MOmlJj7Zo2pzKtOdS9gKBDHxTA&s",
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_projek: projectIds[2], // Use actual project ID
    dokumen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm7Ed-GxL_MOmlJj7Zo2pzKtOdS9gKBDHxTA&s",
    created_at: new Date(),
  },
];

export const supportDocumentDataFactory = async (projectIds: string[], count: number) => {
  const promises = Array.from({ length: count }).map(async () => ({
    id: faker.string.uuid(),
    id_projek: faker.helpers.arrayElement(projectIds), // Use actual project IDs
    dokumen: faker.image.url(),
    created_at: new Date(),
  }));
  return Promise.all(promises);
};
