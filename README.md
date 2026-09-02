# JobTracer — KarirHub Kemnaker Edition

Pelacak otomatis lamaran kerja KarirHub Kemnaker berbasis **Next.js** dan **Chrome Companion Extension (Manifest V3)** dengan antarmuka **Utilitarian Minimalism**.

---

## 🌟 Fitur Utama

1. **Auto-Capture Tanpa Input Manual**:
   - Setiap kali Anda melamar di `karirhub.kemnaker.go.id`, ekstensi secara otomatis merekam nama perusahaan, posisi, gaji, lokasi, dan URL lowongan ke dashboard.
2. **Auto-Detect Status Lamaran Lama**:
   - Membuka halaman lowongan lama yang pernah Anda lamar langsung terbaca dengan status *Menunggu Jawaban* tanpa membuat entri dobel (*zero duplication*).
3. **Background Real-time Status Checker**:
   - Memeriksa perubahan status di KarirHub secara periodik di background tanpa perlu membuka web KarirHub. Notifikasi desktop otomatis muncul jika status berubah menjadi *Interview* atau *Diterima*.
4. **Dual View Pipeline**:
   - **Kanban Board**: Drag & drop kolom Menunggu, Wawancara, Ditolak, Diterima.
   - **Editorial Table**: Tabel ringkas dengan metrik bento grid, filter pencarian, dan tombol status interaktif.
5. **Batch Import & Export**:
   - Impor massal tautan/teks lowongan lama dalam 1 detik.
   - Ekspor data lengkap dalam format CSV.

---

## 🚀 Panduan Deploy ke Vercel

1. **Push ke GitHub**:
   Repository ini sudah terstruktur dan siap di-deploy langsung ke Vercel.
2. **Import di Vercel**:
   - Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
   - Klik **Add New...** > **Project**, lalu pilih repository `RobertDace/Jobseeking-tracer`.
   - Vercel akan otomatis mengenali konfigurasi `vercel.json` dan Next.js.
   - Klik **Deploy**.
3. **Hubungkan Ekstensi ke Vercel URL**:
   - Setelah deploy selesai, salin URL Vercel Anda (contoh: `https://jobseeking-tracer.vercel.app`).
   - Buka ekstensi **KarirHub Auto Tracer** di Chrome, ganti alamat API dari `http://localhost:3000` ke URL Vercel Anda, lalu klik **Simpan**.
   - Sekarang dashboard Anda aktif 24/7 dan bisa dibuka dari HP, tablet, maupun laptop!

---

## 🧩 Cara Memasang Chrome Extension

1. Buka `chrome://extensions` di browser Chrome, Edge, atau Brave.
2. Aktifkan **Developer mode** di pojok kanan atas.
3. Klik tombol **Load unpacked**, lalu pilih folder `extension/`.
4. Ekstensi siap digunakan!

---

## 💻 Menjalankan Secara Lokal

```bash
# Jalankan web dashboard
cd web
npm install
npm run dev
```

Buka `http://localhost:3000` di browser.
