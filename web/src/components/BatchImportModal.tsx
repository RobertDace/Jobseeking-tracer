import React, { useState } from 'react';
import { IconClose, IconExternalLink } from './icons';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchImportModal({ isOpen, onClose, onSuccess }: BatchImportModalProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'auto'>('paste');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!inputText.trim()) {
      setFeedback({ message: 'Harap masukkan link URL lowongan atau teks daftar lamaran.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, status: 'pending' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ message: data.message, type: 'success' });
        setInputText('');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setFeedback({ message: data.error || data.message || 'Gagal mengimpor data.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Terjadi kesalahan saat menghubungkan ke server.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA] bg-[#FBFBFA] shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#787774]">
              Riwayat Pendaftaran Lama
            </span>
            <h3 className="text-base font-semibold text-[#111111] mt-0.5">
              Impor Semua Lamaran KarirHub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#787774] hover:text-[#111111] rounded-md hover:bg-[#EAEAEA] transition-colors cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#EAEAEA] px-6 bg-[#FBFBFA] gap-4">
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'border-[#111111] text-[#111111] font-semibold'
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Tempel Link / Daftar Lamaran
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'auto'
                ? 'border-[#111111] text-[#111111] font-semibold'
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Tarik Otomatis dari KarirHub
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'paste' ? (
            <div className="space-y-3">
              <div className="p-3 bg-[#FBF3DB]/40 border border-[#F3E7C4] rounded-md text-xs text-[#956400] leading-relaxed">
                <strong>Opsi Praktis (Bebas Masalah Website Lemot):</strong>
                <p className="mt-1">
                  Tempelkan tautan URL lowongan KarirHub yang pernah Anda lamar, atau tulis nama posisi dan perusahaan (1 baris per lowongan). Semua otomatis tercatat dengan status <strong>Menunggu Balasan</strong> tanpa duplikat.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1.5">
                  Daftar Tautan URL atau Teks (1 Baris = 1 Lowongan)
                </label>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Contoh tempel URL atau teks:\nhttps://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan/it-officer-...\nSecurity Operation Center Manager - PT. Huawei Tech Investment\nSoftware Engineer - PT Bank Central Asia`}
                  className="w-full p-3 text-xs border border-[#EAEAEA] rounded-md bg-[#FBFBFA] focus:bg-white focus:border-[#111111] outline-none font-mono resize-none leading-relaxed"
                />
              </div>

              {feedback && (
                <div
                  className={`p-2.5 rounded text-xs font-medium ${
                    feedback.type === 'success'
                      ? 'bg-[#EDF3EC] text-[#346538] border border-[#D7E7D5]'
                      : 'bg-[#FDEBEC] text-[#9F2F2D] border border-[#F8D3D6]'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-xs text-[#2F3437] leading-relaxed">
              <div className="p-3 bg-[#E1F3FE]/40 border border-[#CAE7FC] rounded-md text-[#1F6C9F]">
                <strong>Sinkronisasi Halaman Riwayat:</strong>
                <p className="mt-1">
                  Jika web KarirHub bisa dibuka, Anda cukup membuka halaman <em>Lamaran Saya</em>. Ekstensi JobTracer akan otomatis memindai dan menyelaraskan semua lowongan Anda sekaligus.
                </p>
              </div>

              <div className="space-y-2">
                <a
                  href="https://karirhub.kemnaker.go.id/pelamar/lamaran-saya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-md bg-[#111111] text-white flex items-center justify-center gap-2 font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  <span>Buka Halaman &quot;Lamaran Saya&quot; di KarirHub</span>
                  <IconExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="text-[11px] text-[#787774] text-center pt-2">
                  Ekstensi kami akan langsung menampilkan tombol <em>&quot;Sync Semua Status ke JobTracer&quot;</em> di pojok kiri bawah layar KarirHub.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EAEAEA] bg-[#FBFBFA] flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className="btn-secondary text-xs">
            Batal
          </button>
          {activeTab === 'paste' && (
            <button
              onClick={handleImport}
              disabled={isLoading}
              className="btn-primary text-xs"
            >
              {isLoading ? 'Mengimpor...' : 'Impor Sekarang'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
