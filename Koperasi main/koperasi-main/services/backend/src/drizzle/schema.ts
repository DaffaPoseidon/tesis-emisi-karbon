import { relations } from "drizzle-orm";
import { pgTable, varchar, uuid, integer, pgEnum, timestamp, text, date } from "drizzle-orm/pg-core";

export const UserRole = pgEnum("user_role", ["ADMIN", "BASIC", "PLATINUM"]);
export const UserStatus = pgEnum("user_status", ["AKTIF", "TIDAK AKTIF", "DITOLAK", "MENUNGGU KONFIRMASI", "OTP TERKIRIM"]);
export const ReportProgress = pgEnum("report_progress", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);
export const StatusProject = pgEnum("status_project", ["DRAFT", "PROSES VERIFIKASI", "REVISI", "APPROVAL", "TTD KONTRAK", "PENDANAAN DIBUKA", "BERJALAN", "DIBATALKAN", "DITOLAK", "SELESAI", "BERJALAN SIKLUS 2", "BERJALAN SIKLUS 3", "BERJALAN SIKLUS 4", "BERJALAN SIKLUS 5", "BERJALAN SIKLUS 6", "BERJALAN SIKLUS 7", "BERJALAN SIKLUS 8", "BERJALAN SIKLUS 9", "BERJALAN SIKLUS 10", "BERJALAN SIKLUS 11", "BERJALAN SIKLUS 12", "BERJALAN SIKLUS 13", "BERJALAN SIKLUS 14", "BERJALAN SIKLUS 15", "BERJALAN SIKLUS 16", "BERJALAN SIKLUS 17", "BERJALAN SIKLUS 18", "BERJALAN SIKLUS 19", "BERJALAN SIKLUS 20"]);
export const StatusHistoryProject = pgEnum("status_history", ["SUCCESS", "FAILED", "PENDING"]);
export const JenisWallet = pgEnum("jenis_wallet", ["SIMPANAN WAJIB", "SIMPANAN POKOK", "SALDO", "KAS KOPERASI"]);
export const JenisTopup = pgEnum("jenis_topup", ["SIMPANAN WAJIB", "SIMPANAN POKOK", "TOPUP SALDO", "PENARIKAN SALDO", "UPGRADE USER", "PELAKSANA", "PEMILIK"]);
export const JenisLaporan = pgEnum("jenis_laporan", ["UNTUNG", "RUGI"]);
export const StatusPembayaran = pgEnum("status", ["SUKSES", "GAGAL", "MENUNGGU KONFIRMASI"]);

export const UserTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: varchar("nama", { length: 255 }).notNull(),
  no_hp: varchar("no_hp").notNull().unique(),
  role: UserRole("user_role"),
  status: UserStatus("user_status").default("TIDAK AKTIF").notNull(),
  password: varchar("password").notNull(),
  tempat_lahir: varchar("tempat_lahir").notNull(),
  tanggal_lahir: date("tanggal_lahir").notNull(),
  provinsi: varchar("provinsi").notNull(),
  kota: varchar("kota").notNull(),
  kecamatan: varchar("kecamatan").notNull(),
  alamat: varchar("alamat").notNull(),
  nik: varchar("nik").notNull(),
  foto_profile: text("foto_profile"),
  foto_diri: text("foto_diri").notNull(),
  foto_ktp: text("foto_ktp").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
  otp: varchar("otp"),
});

export const ProjectCategoryTable = pgTable("project_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  kategori: varchar("kategori", { length: 255 }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const ProjectTable = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_user: uuid("id_user")
    .notNull()
    .references(() => UserTable.id),
  id_kategori: uuid("id_kategori")
    .notNull()
    .references(() => ProjectCategoryTable.id),
  judul: varchar("judul", { length: 255 }).notNull(),
  deskripsi: text("deskripsi").notNull(),
  nominal: integer("nominal").notNull(),
  asset_jaminan: varchar("asset_jaminan").notNull(),
  nilai_jaminan: integer("nilai_jaminan").notNull(),
  lokasi_usaha: varchar("lokasi_usaha").notNull(),
  detail_lokasi: text("detail_lokasi").notNull(),
  brosur_produk: text("brosur_produk"),
  pendapatan_perbulan: integer("pendapatan_perbulan").notNull(),
  pengeluaran_perbulan: integer("pengeluaran_perbulan").notNull(),
  report_progress: ReportProgress("report_progress"),
  dokumen_proyeksi: text("dokumen_proyeksi").notNull(),
  status: StatusProject("status_project").notNull(),
  nominal_disetujui: integer("nominal_disetujui"),
  harga_per_unit: integer("harga_per_unit"),
  jumlah_koin: integer("jumlah_koin"),
  minimal_pembelian: integer("minimal_pembelian"),
  maksimal_pembelian: integer("maksimal_pembelian"),
  mulai_penggalangan_dana: date("mulai_penggalangan_dana"),
  selesai_penggalangan_dana: date("selesai_penggalangan_dana"),
  dokumen_prospektus: text("dokumen_prospektus"),
  limit_siklus: integer("limit_siklus"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const SupportDocumentTable = pgTable("support_document", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_projek: uuid("id_projek")
    .notNull()
    .references(() => ProjectTable.id),
  dokumen: text("dokumen").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const ProjectReportTable = pgTable("project_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_projek: uuid("id_projek")
    .notNull()
    .references(() => ProjectTable.id),
  judul: varchar("judul", { length: 255 }).notNull(),
  jenis_laporan: JenisLaporan("jenis_laporan").notNull(),
  modal: integer("modal").notNull(),
  nominal: integer("nominal").notNull(),
  // laporan: text("laporan").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const ProjectMutationReportTable = pgTable("project_mutation_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_projek: uuid("id_projek")
    .notNull()
    .references(() => ProjectTable.id),
  judul: varchar("judul", { length: 255 }).notNull(),
  pemasukan: integer("pemasukan"),
  pengeluaran: integer("pengeluaran"),
  laporan: text("laporan").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const HistoryProjectTable = pgTable("history_project", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_projek: uuid("id_projek")
    .notNull()
    .references(() => ProjectTable.id),
  history: text("history").notNull(),
  keterangan: text("keterangan"),
  status: StatusHistoryProject("status_project").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const WalletTable = pgTable("wallet", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_user: uuid("id_user")
    .notNull()
    .references(() => UserTable.id),
  jenis_wallet: JenisWallet("jenis_wallet").notNull(),
  saldo: integer("saldo").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const TopupTable = pgTable("topup", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_wallet: uuid("id_wallet")
    .notNull()
    .references(() => WalletTable.id),
  nama: varchar("nama").notNull(),
  nama_bank: varchar("nama_bank"),
  no_rekening: varchar("no_rekening"),
  nama_pemilik_rekening: varchar("nama_pemilik_rekening"),
  nominal: integer("nominal").notNull(),
  jenis: JenisTopup("jenis_topup").notNull(),
  bukti_pembayaran: text("bukti_pembayaran"),
  status: StatusPembayaran("status").default("MENUNGGU KONFIRMASI"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const SignatureAdminTable = pgTable("signature_admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_user: uuid("id_user")
    .notNull()
    .references(() => UserTable.id),
  signature: text("signature"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const ChartProjectTable = pgTable("chart_project", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_projek: uuid("id_projek")
    .notNull()
    .references(() => ProjectTable.id),
  nominal: integer("nominal").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const ProjectWalletTable = pgTable("project_wallet", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_projek: uuid("id_projek")
    .notNull()
    .references(() => ProjectTable.id),
  dana_terkumpul: integer("dana_terkumpul").notNull().default(0),
  saldo: integer("saldo").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const HistoryProjectWalletTable = pgTable("history_project_wallet", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_project_wallet: uuid("id_project_wallet")
    .notNull()
    .references(() => ProjectWalletTable.id),
  nominal: integer("nominal").notNull(),
  dana_tersisa: integer("dana_tersisa").notNull(),
  deskripsi: text("deskripsi").notNull(),
  bukti_transfer: text("bukti_transfer"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Relation definition

export const usersWalletRelations = relations(UserTable, ({ many }) => ({
  wallet: many(WalletTable),
  project: many(ProjectTable),
}));

export const walletUsersRelations = relations(WalletTable, ({ one }) => ({
  author: one(UserTable, {
    fields: [WalletTable.id_user],
    references: [UserTable.id],
  }),
}));

export const walletTopupRelations = relations(WalletTable, ({ many }) => ({
  topup: many(TopupTable),
}));

export const topupWalletRelations = relations(TopupTable, ({ one }) => ({
  wallet: one(WalletTable, {
    fields: [TopupTable.id_wallet],
    references: [WalletTable.id],
  }),
}));

export const projectCategoryRelations = relations(ProjectCategoryTable, ({ many }) => ({
  project: many(ProjectTable),
}));

export const projectRelations = relations(ProjectTable, ({ one, many }) => ({
  category: one(ProjectCategoryTable, {
    fields: [ProjectTable.id_kategori],
    references: [ProjectCategoryTable.id],
  }),
  document: many(SupportDocumentTable),
  report: many(ProjectReportTable),
  mutation: many(ProjectMutationReportTable),
  history: many(HistoryProjectTable),
  wallet: one(ProjectWalletTable),
}));

export const supportDocumentRelations = relations(SupportDocumentTable, ({ one }) => ({
  project: one(ProjectTable, {
    fields: [SupportDocumentTable.id_projek],
    references: [ProjectTable.id],
  }),
}));

export const projectReportRelations = relations(ProjectReportTable, ({ one }) => ({
  project: one(ProjectTable, {
    fields: [ProjectReportTable.id_projek],
    references: [ProjectTable.id],
  }),
}));

export const projectMutationReportRelations = relations(ProjectMutationReportTable, ({ one }) => ({
  project: one(ProjectTable, {
    fields: [ProjectMutationReportTable.id_projek],
    references: [ProjectTable.id],
  }),
}));

export const historyProjectRelations = relations(HistoryProjectTable, ({ one }) => ({
  project: one(ProjectTable, {
    fields: [HistoryProjectTable.id_projek],
    references: [ProjectTable.id],
  }),
}));

export const chartProjectRelations = relations(ChartProjectTable, ({ one }) => ({
  project: one(ProjectTable, {
    fields: [ChartProjectTable.id_projek],
    references: [ProjectTable.id],
  }),
}));