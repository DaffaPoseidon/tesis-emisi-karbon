import { relations } from "drizzle-orm";
import { pgTable, varchar, uuid, integer, pgEnum, timestamp, text } from "drizzle-orm/pg-core";

export const JenisTopup = pgEnum("jenis_topup", ["TOPUP SALDO", "PENARIKAN SALDO", "UPGRADE USER"]);
export const StatusPembayaran = pgEnum("status", ["SUKSES", "GAGAL", "MENUNGGU KONFIRMASI"]);

export const WalletTable = pgTable("wallet", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_user: uuid("id_user"),
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

// Relation definition

export const walletTopupRelations = relations(WalletTable, ({ many }) => ({
  topup: many(TopupTable),
}));

export const topupWalletRelations = relations(TopupTable, ({ one }) => ({
  wallet: one(WalletTable, {
    fields: [TopupTable.id_wallet],
    references: [WalletTable.id],
  }),
}));