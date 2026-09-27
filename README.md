# Portal Presensi & Formulir Seminar E-SAPARI 2026 (UKMPR)

Sistem proteksi dan manajemen akses Google Formulir berbasis **Token Dinamis** dan **Validasi Nomor WhatsApp Terdaftar** untuk seminar UKM Penalaran & Riset (UKMPR) Universitas Hindu Negeri I Gusti Bagus Sugriwa Denpasar.

---

## 🌟 Fitur Utama

### 1. Portal Peserta (`/`)
- **Proteksi Ganda**: Peserta wajib memasukkan **Token Akses** dan **Nomor WhatsApp/HP**.
- **Validasi Nomor HP Otomatis**: Memeriksa terhadap 148 nomor peserta terdaftar dari formulir pendaftaran E-SAPARI. Normalisasi otomatis berbagai format nomor (`08...`, `+628...`, `628...`, spasi, strip/tanda hubung, karakter tersembunyi).
- **Penolakan Cerdas**: Jika nomor tidak terdaftar, akses langsung ditolak dengan pesan yang jelas.
- **Embedded Google Form Aman**:
  - Mengisolasi Google Formulir agar tidak disebarluaskan secara publik.
  - Header identitas peserta terverifikasi: Nama Lengkap, Instansi, dan Jurusan.
  - **Hitung Mundur Waktu Aktif (WITA)**: Form otomatis terkunci saat masa berlaku token habis.
  - Proteksi anti-salin / pencegahan klik kanan.
  - Tombol konfirmasi "Selesai Mengisi".

### 2. Panel Admin / Panitia (`/admin` atau `/ukmpr-sapari19/admin`)
- **Keamanan PIN Admin**: Dilindungi kata sandi panitia (Default: `ukmpr-sapari19`).
- **Generator Token Acak**:
  - Tombol 1-klik untuk generate token acak (contoh: `SAPARI-9F8K`) atau custom code.
  - 1 token berlaku untuk semua peserta terdaftar.
  - Pengaturan durasi aktif berbasis **WITA (Waktu Indonesia Tengah - UTC+8)**: preset 15 menit, 30 menit, 45 menit, 1 jam, 2 jam, 24 jam, atau tanggal & jam berakhir kustom.
  - Tombol 1-klik salin token untuk dibagikan ke peserta di ruangan seminar.
  - Toggle On/Off untuk mengaktifkan atau menonaktifkan token kapan saja.
- **Direktori 148 Peserta Terdaftar**:
  - Pencarian instan (Nama, No HP, Jurusan, Instansi).
  - Tautan langsung ke bukti follow Instagram di Google Drive.
  - Tombol 1-klik "Sinkronkan 148 Peserta ke Supabase".
- **Pemantauan Presensi Realtime (Access Logs)**:
  - Melihat riwayat peserta yang memasukkan token, status verifikasi (`Akses Diberikan`, `No HP Tidak Terdaftar`, `Token Expired`, `Token Salah`), waktu akses (WITA).
- **Setup Database Supabase**:
  - Tampilan kode SQL skema tabel dan tombol 1-klik "Salin Kode SQL".

---

## 🗄️ Langkah Setup Database Supabase

Proyek Supabase Anda:
- **URL**: `https://pmhsrkboqnxwcczaxajq.supabase.co`
- **Key**: `sb_publishable_uDl2rQQAduKBQInOUvh32Q_as1aPLnu`

### Langkah Menjalankan SQL di Supabase:
1. Buka dashboard proyek Supabase Anda di browser.
2. Pilih menu **SQL Editor** di bilah navigasi kiri.
3. Klik **+ New Query**.
4. Buka file `supabase/schema.sql` (atau salin langsung dari tab **Setup Database** di panel admin web).
5. Tempelkan seluruh kode SQL tersebut ke SQL Editor Supabase, lalu klik tombol hijau **Run**.
6. Setelah tabel berhasil dibuat, buka panel admin web Anda di `/admin` lalu klik tombol **Sinkronkan 148 Peserta ke Supabase**.

---

## 🚀 Panduan Hosting ke Vercel

1. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: implement token form gating and supabase integration"
   git push origin main
   ```
2. **Deploy di Vercel**:
   - Masuk ke [Vercel](https://vercel.com) dan impor repository ini.
   - Tambahkan **Environment Variables** berikut di Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://pmhsrkboqnxwcczaxajq.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_uDl2rQQAduKBQInOUvh32Q_as1aPLnu`
     - `NEXT_PUBLIC_GOOGLE_FORM_URL`: `https://docs.google.com/forms/d/e/1FAIpQLScnQ3eY0WEWIy7u4zuABj8mm_NbqX3P6SqNRlPjKwLDO1y2QA/viewform?embedded=true`
     - `ADMIN_SECRET_PIN`: `ukmpr-sapari19`
   - Klik **Deploy**.

---

## 💻 Menjalankan Secara Lokal

```bash
# Jalankan server pengembangan
npm run dev

# Buka browser
# Portal Peserta: http://localhost:3000
# Panel Admin:    http://localhost:3000/ukmpr-sapari19/admin
```

---

© 2026 UKM Penalaran & Riset (UKMPR) • Universitas Hindu Negeri I Gusti Bagus Sugriwa Denpasar.
