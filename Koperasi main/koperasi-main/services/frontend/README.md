# Nama Proyek

Deskripsi proyek Anda di sini.

## Prasyarat

- Node.js (disarankan v18 atau lebih tinggi)
- npm atau yarn

## Panduan Memulai

### 1. Mengunduh Repositori

```bash
git clone [url-repositori-anda]
cd [direktori-proyek]
```

### 2. Instalasi Dependensi

```bash
# Menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

## Pengembangan Lokal

Untuk menjalankan server pengembangan:

```bash
# Menggunakan npm
npm run dev

# Atau menggunakan yarn
yarn dev
```

Aplikasi akan tersedia di `http://localhost:3000`

## Membangun untuk Produksi

### 1. Membuat Build Produksi

```bash
# Menggunakan npm
npm run build

# Atau menggunakan yarn
yarn build
```

### 2. Menjalankan Server Produksi

```bash
# Menggunakan npm
npm start

# Atau menggunakan yarn
yarn start
```

Aplikasi akan tersedia di `http://localhost:3000` (atau PORT yang telah dikonfigurasi)

## Hasil Build

Proses build akan menghasilkan dua direktori utama:
- `build/server` - Kode sisi server
- `build/client` - Aset statis dan kode sisi klien

## Deployment

### Variabel Lingkungan

Buat file `.env` di direktori utama:

```env
DATABASE_URL="url-database-anda"
SESSION_SECRET="kunci-rahasia-anda"
# Tambahkan variabel lingkungan lain sesuai kebutuhan
```

### Pilihan Hosting

Anda dapat men-deploy aplikasi Remix ini ke berbagai platform:
- Vercel
- Netlify
- Fly.io
- Server Node.js kustom

### Deployment Manual

Untuk deployment ke server kustom:
1. Transfer hasil build (`build/` directory) ke server Anda
2. Instal dependensi produksi
3. Atur variabel lingkungan
4. Jalankan server produksi menggunakan `npm start`

## Teknologi yang Digunakan

- [Remix](https://remix.run/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## Dokumentasi Tambahan

- [Dokumentasi Remix](https://remix.run/docs)
- [Dokumentasi Tailwind CSS](https://tailwindcss.com/docs)
- [Dokumentasi Vite](https://vitejs.dev/guide/)