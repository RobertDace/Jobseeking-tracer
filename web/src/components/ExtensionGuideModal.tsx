import React from 'react';
import { IconClose } from './icons';

interface ExtensionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtensionGuideModal({ isOpen, onClose }: ExtensionGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA] bg-[#FBFBFA]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#346538]" />
            <h3 className="text-sm font-semibold text-[#111111]">
              Panduan Integrasi KarirHub Auto Tracer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#787774] hover:text-[#111111] hover:bg-[#EAEAEA] transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] mb-2">
              Langkah Pemasangan Ekstensi di Chrome / Edge / Brave:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[#787774]">
              <li>
                Buka tab baru di browser Anda dan ketik: <code className="font-mono bg-[#F7F6F3] px-1.5 py-0.5 rounded text-[#111111]">chrome://extensions</code>
              </li>
              <li>
                Aktifkan toggle <strong>&quot;Developer mode&quot;</strong> di pojok kanan atas layar ekstensi.
              </li>
              <li>
                Klik tombol <strong>&quot;Load unpacked&quot;</strong> di pojok kiri atas.
              </li>
              <li>
                Pilih folder berikut di komputer Anda:
                <div className="mt-1.5 p-2 bg-[#F7F6F3] border border-[#EAEAEA] rounded font-mono text-[11px] text-[#111111] select-all break-all">
                  F:\Projectan\jobtracer\extension
                </div>
              </li>
              <li>
                Ekstensi <strong>JobTracer Companion</strong> kini aktif dan terhubung ke dashboard!
              </li>
            </ol>
          </div>

          <div className="border-t border-[#EAEAEA] pt-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] mb-2">
              Fitur Otomatis yang Berjalan:
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded border border-[#EAEAEA] bg-[#FBFBFA]">
                <div className="font-semibold text-[#111111] mb-0.5">1. Auto-Capture saat Lamar</div>
                <div className="text-[#787774]">
                  Setiap kali Anda menekan tombol &quot;Lamar Sekarang&quot; atau &quot;Kirim Lamaran&quot; di KarirHub, ekstensi secara otomatis membaca nama PT, posisi, lokasi, dan tanggal lamaran ke dashboard ini.
                </div>
              </div>
              <div className="p-2.5 rounded border border-[#EAEAEA] bg-[#FBFBFA]">
                <div className="font-semibold text-[#111111] mb-0.5">2. Auto-Sync Riwayat Lamaran</div>
                <div className="text-[#787774]">
                  Saat Anda membuka halaman <em>Lamaran Saya</em> di KarirHub, status lamaran terkini (Panggilan Wawancara, Ditolak, Seleksi Berkas) dapat langsung disinkronkan hanya dengan satu klik tombol sinkronisasi.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-[#787774]">
            Pastikan web dashboard ini tetap berjalan di <code className="font-mono bg-[#F7F6F3] px-1 py-0.5 rounded">http://localhost:3000</code>.
          </div>
        </div>

        <div className="p-4 border-t border-[#EAEAEA] bg-[#FBFBFA] flex justify-end">
          <button onClick={onClose} className="btn-primary text-xs">
            Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
