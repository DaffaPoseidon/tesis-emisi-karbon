import { faker } from "@faker-js/faker/locale/id_ID";
import { hash } from "bcryptjs";
import { format, subMonths } from "date-fns";

export const userData = async () => [
  {
    id: "0937d7fc-8aa2-4ce5-b437-64b755ce5ff6",
    nama: "Admin Koperasi",
    no_hp: "6281234567890",
    role: "ADMIN",
    status: "AKTIF",
    password: await hash("password", 10),
    tempat_lahir: "Malang",
    tanggal_lahir: format(new Date("2002-02-02"), "yyyy-MM-dd"),
    provinsi: "35",
    kota: "35.73",
    kecamatan: "35.73.05",
    alamat: "Jl. Raya Tlogomas No. 246",
    nik: "3501234567890123",
    foto_diri: "/uploads/foto_diri/1730168622601-fotodiri.png",
    foto_ktp: "/uploads/foto_ktp/1730168622601-fotoktp.png",
    created_at: new Date(),
  },
  {
    id: "1d798a08-0602-4030-b8df-b808134ec171",
    nama: "budiono siregar",
    no_hp: "6281234567891",
    role: "BASIC",
    status: "AKTIF",
    password: await hash("password", 10),
    tempat_lahir: "Surabaya",
    tanggal_lahir: format(new Date("2003-03-03"), "yyyy-MM-dd"),
    provinsi: "35",
    kota: "35.78",
    kecamatan: "35.78.03",
    alamat: "Jl. Darmo No. 10",
    nik: "3501234567890124",
    foto_diri: "/uploads/foto_diri/1730168622602-fotodiri.png",
    foto_ktp: "/uploads/foto_ktp/1730168622602-fotoktp.png",
    created_at: new Date(),
    otp: "2233",
  },
  {
    id: "a258fc20-32fd-4bce-9a99-85dd2551fab7",
    nama: "siti nurhaliza",
    no_hp: "6281234567892",
    role: "PLATINUM",
    status: "AKTIF",
    password: await hash("password", 10),
    tempat_lahir: "Jakarta",
    tanggal_lahir: format(new Date("2004-04-04"), "yyyy-MM-dd"),
    provinsi: "31",
    kota: "31.74",
    kecamatan: "31.74.01",
    alamat: "Jl. Mampang Prapatan No. 20",
    nik: "3501234567890125",
    foto_diri: "/uploads/foto_diri/1730168622603-fotodiri.png",
    foto_ktp: "/uploads/foto_ktp/1730168622603-fotoktp.png",
    created_at: new Date(),
    otp: "2234",
  },
];

export const userDataFactory = async (count: any) => {
  const promises = Array.from({ length: count }).map(async () => {
    const birthDate = subMonths(new Date(), faker.number.int({ min: 1, max: 12 }));

    return {
      id: faker.string.uuid(),
      nama: faker.person.fullName(),
      no_hp: `62${faker.string.numeric(11)}`,
      role: "BASIC",
      status: "TIDAK AKTIF",
      password: await hash("password", 10),
      tempat_lahir: faker.location.city(),
      tanggal_lahir: format(birthDate, "yyyy-MM-dd"),
      provinsi: "35",
      kota: "35.73",
      kecamatan: faker.helpers.arrayElement(["35.73.01", "35.73.02", "35.73.03", "35.73.04", "35.73.05"]),
      alamat: faker.location.streetAddress(),
      nik: faker.string.numeric({ length: 16 }),
      foto_diri: faker.image.avatar(),
      foto_ktp: faker.image.avatar(),
      created_at: new Date(),
      verification_token: faker.string.numeric({ length: 64 }),
      is_verified: true,
    };
  });

  return Promise.all(promises);
};
