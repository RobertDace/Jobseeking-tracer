# KarirHub Auto Tracer - Browser Extension Companion

Ekstensi browser pendamping untuk otomatis melacak lamaran kerja dari portal **KarirHub Kemnaker** (`karirhub.kemnaker.go.id`) dan mengirimkannya langsung ke Web Dashboard Next.js.

## Cara Pemasangan di Chrome / Edge / Brave

1. Buka browser Anda, lalu ketik alamat berikut di URL bar:
   - Google Chrome: `chrome://extensions`
   - Microsoft Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Aktifkan **Developer mode** (Mode Pengembang) di pojok kanan atas.
3. Klik tombol **Load unpacked** (Muat ekstensi yang belum dibongkar) di pojok kiri atas.
4. Pilih folder:
   ```
   F:\Projectan\jobtracer\extension
   ```
5. Ekstensi **KarirHub Auto Tracer** akan langsung aktif!

## Cara Kerja Otomasi
1. **Perekaman Otomatis**: Setiap kali Anda membuka lowongan di `karirhub.kemnaker.go.id` lalu mengklik tombol **Lamar Sekarang** / **Kirim Lamaran**, ekstensi akan langsung mengekstrak posisi, nama perusahaan, lokasi, dan URL lowongan, lalu mengirimkannya ke Next.js Dashboard. Status default: `Menunggu Balasan`.
2. **Sinkronisasi Status Otomatis**: Saat Anda membuka halaman **Lamaran Saya** di KarirHub, ekstensi dapat membaca status terkini (*Panggilan Wawancara*, *Ditolak*, *Seleksi Berkas*) dan memperbarui data di dashboard secara otomatis.
3. **Indikator Visual**: Terdapat badge minimalist di pojok halaman serta notifikasi toast saat lamaran berhasil dicatat.
