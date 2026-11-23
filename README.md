# SonicCloud Web v1.0

Website streaming musik berbasis Next.js, PostgreSQL Railway, Prisma ORM, Auth.js, dan Railway Storage Bucket. Fokus versi pertama hanya website. Flutter/mobile tidak termasuk implementasi ini.

## Fitur
- Registrasi, login, logout dengan Auth.js Credentials dan JWT session.
- Password hashing menggunakan Argon2.
- Katalog musik publik, pencarian, dan filter genre.
- Upload MP3 dan cover ke Railway Storage Bucket.
- Moderasi lagu oleh admin: approve/reject.
- Streaming melalui presigned URL dari private Railway Bucket.
- Playlist, favorites, dan listening history.
- Dashboard admin, moderasi musik, pengelolaan genre, dan aktivasi/nonaktivasi pengguna.
- Pengelolaan musik milik pengguna (arsip dan pembaruan metadata untuk lagu pending/rejected).

## Teknologi
- Next.js App Router + TypeScript
- Tailwind CSS v4 (styling dasar)
- PostgreSQL + Prisma ORM 7
- Auth.js Credentials + JWT session
- Argon2
- AWS SDK for JavaScript S3 client
- Railway deployment dan Railway Storage Bucket

## Persyaratan
- Node.js 22.12+ atau Node.js 24 LTS
- npm
- Railway PostgreSQL service
- Railway Storage Bucket

## Menjalankan secara lokal

1. Ekstrak ZIP dan buka folder `soniccloud-v1` di VS Code.
2. Salin `.env.example` menjadi `.env`.
3. Isi `DATABASE_URL` dengan koneksi PostgreSQL Railway atau database PostgreSQL lokal.
4. Isi `AUTH_SECRET` dengan secret acak yang kuat. Contoh membuatnya:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

5. Isi kredensial Railway Bucket:
   - `S3_BUCKET` dari variabel Railway `BUCKET`
   - `S3_ENDPOINT` dari `ENDPOINT`
   - `S3_REGION` dari `REGION`
   - `S3_ACCESS_KEY_ID` dari `ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY` dari `SECRET_ACCESS_KEY`
6. Instal dependensi:

   ```bash
   npm install
   ```

7. Generate Prisma Client:

   ```bash
   npm run db:generate
   ```

8. Buat migrasi database:

   ```bash
   npm run db:migrate -- --name init
   ```

9. Isi `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `ADMIN_NAME` di `.env`, lalu jalankan:

   ```bash
   npm run db:seed
   ```

10. Jalankan website:

   ```bash
   npm run dev
   ```

11. Buka `http://localhost:3000`.

## Menyiapkan admin setelah database tersedia

```bash
npm run admin:create -- admin@example.com "PasswordAdminYangKuat" "SonicCloud Admin"
```

Jangan gunakan password contoh di atas untuk deployment produksi.

## Deployment ke Railway

1. Push source code ke repository GitHub.
2. Buat Railway project dan tambahkan PostgreSQL service.
3. Tambahkan Storage Bucket pada project Railway.
4. Buat Next.js service dari repository GitHub.
5. Atur variable service Next.js:
   - `DATABASE_URL` menggunakan reference ke PostgreSQL `DATABASE_URL`.
   - `AUTH_SECRET` dengan secret acak kuat.
   - `AUTH_URL` menggunakan domain aplikasi.
   - `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` menggunakan variable reference bucket.
6. Jalankan migrasi produksi dengan `npm run db:deploy` sebelum aplikasi menerima traffic. Gunakan Railway pre-deploy command jika tersedia pada konfigurasi deployment.
7. Build command: `npm run build`.
8. Start command: `npm run start`.
9. Buat admin dengan script seed atau `npm run admin:create`.

## Catatan Storage
Railway Buckets bersifat privat. Kode membuat presigned GET URL untuk streaming dan menampilkan cover. Upload diproksikan melalui Next.js Route Handler ke bucket. File MP3 dibatasi 20 MB dan cover 5 MB pada MVP. Untuk trafik produksi, evaluasi upload langsung menggunakan presigned PUT, multipart upload, rate limiting, dan biaya service egress.

## Batas verifikasi paket

Source code disusun sebagai fondasi MVP. Instalasi dependensi dan build perlu dijalankan pada komputer pengembang dengan akses npm dan kredensial database/storage yang valid.

## Catatan keamanan penting
- Jangan commit `.env` ke GitHub.
- Jangan pernah mengirim S3 secret ke browser.
- Role admin tidak dapat dipilih saat registrasi publik.
- Auth.js Credentials menggunakan JWT session karena tidak memakai database adapter.
- Tambahkan rate limiting pada endpoint login/register sebelum aplikasi dibuka untuk publik.
- Terapkan backup PostgreSQL dan uji pemulihan.
- Validasi hak cipta dan izin file musik sebelum publikasi.
- Kode ini adalah fondasi MVP dan tetap memerlukan pengujian keamanan, integrasi, dan beban sebelum produksi.

## ERD
Tujuh tabel inti: `users`, `genres`, `songs`, `playlists`, `playlist_songs`, `favorites`, `listening_history`.

## Dokumentasi resmi
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Prisma ORM: https://www.prisma.io/docs
- Auth.js Credentials: https://authjs.dev/getting-started/authentication/credentials
- Railway Buckets: https://docs.railway.com/storage-buckets
- Railway upload and serving: https://docs.railway.com/storage-buckets/uploading-serving
