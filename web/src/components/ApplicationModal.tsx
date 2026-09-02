import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { IconClose, IconExternalLink, IconTrash } from './icons';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onSave: (data: Partial<JobApplication>) => void;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS: {
  status: ApplicationStatus;
  label: string;
  dotColor: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}[] = [
  {
    status: 'pending',
    label: 'Menunggu Balasan',
    dotColor: 'bg-[#956400]',
    activeBg: 'bg-[#FBF3DB]',
    activeBorder: 'border-[#956400]/40',
    activeText: 'text-[#956400]',
  },
  {
    status: 'interview',
    label: 'Panggilan Interview',
    dotColor: 'bg-[#1F6C9F]',
    activeBg: 'bg-[#E1F3FE]',
    activeBorder: 'border-[#1F6C9F]/40',
    activeText: 'text-[#1F6C9F]',
  },
  {
    status: 'rejected',
    label: 'Ditolak',
    dotColor: 'bg-[#9F2F2D]',
    activeBg: 'bg-[#FDEBEC]',
    activeBorder: 'border-[#9F2F2D]/40',
    activeText: 'text-[#9F2F2D]',
  },
  {
    status: 'offered',
    label: 'Diterima / Offering',
    dotColor: 'bg-[#346538]',
    activeBg: 'bg-[#EDF3EC]',
    activeBorder: 'border-[#346538]/40',
    activeText: 'text-[#346538]',
  },
];

export default function ApplicationModal({
  isOpen,
  onClose,
  application,
  onSave,
  onDelete
}: ApplicationModalProps) {
  const [prevAppId, setPrevAppId] = useState<string | undefined>(application?.id);
  const [formData, setFormData] = useState<Partial<JobApplication>>(() =>
    application ? {
      company_name: application.company_name,
      job_title: application.job_title,
      location: application.location,
      salary_range: application.salary_range || '',
      job_url: application.job_url || '',
      status: application.status,
      notes: application.notes || '',
      interview_date: application.interview_date || '',
      tags: application.tags || []
    } : {
      company_name: '',
      job_title: '',
      location: 'Jakarta, Indonesia',
      salary_range: '',
      job_url: 'https://karirhub.kemnaker.go.id',
      status: 'pending',
      notes: '',
      interview_date: '',
      tags: ['KarirHub']
    }
  );

  // Sync form data when application prop changes without triggering useEffect setState cascading renders
  if (application?.id !== prevAppId) {
    setPrevAppId(application?.id);
    setFormData(application ? {
      company_name: application.company_name,
      job_title: application.job_title,
      location: application.location,
      salary_range: application.salary_range || '',
      job_url: application.job_url || '',
      status: application.status,
      notes: application.notes || '',
      interview_date: application.interview_date || '',
      tags: application.tags || []
    } : {
      company_name: '',
      job_title: '',
      location: 'Jakarta, Indonesia',
      salary_range: '',
      job_url: 'https://karirhub.kemnaker.go.id',
      status: 'pending',
      notes: '',
      interview_date: '',
      tags: ['KarirHub']
    });
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isEditing = !!application;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA] bg-[#FBFBFA] shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#787774]">
              {isEditing ? 'Detail & Edit Lamaran' : 'Tambah Lamaran Baru'}
            </span>
            <h3 className="text-base font-semibold text-[#111111] mt-0.5">
              {isEditing ? application.job_title : 'Catat Lowongan Kerja'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#787774] hover:text-[#111111] rounded-md hover:bg-[#EAEAEA] transition-colors cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Form with separated scrollable body and fixed footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Modal Body - Scrollable */}
          <div className="p-6 overflow-y-auto space-y-4.5 flex-1">
            {/* Status Selection - 2x2 Grid with clean readable chips */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-2">
                Status Lamaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = formData.status === opt.status;
                  return (
                    <button
                      type="button"
                      key={opt.status}
                      onClick={() => setFormData({ ...formData, status: opt.status })}
                      className={`px-3 py-2.5 rounded-md border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? `${opt.activeBg} ${opt.activeBorder} ${opt.activeText} ring-1 ring-current font-semibold`
                          : 'border-[#EAEAEA] bg-[#FBFBFA] text-[#2F3437] hover:bg-[#F0F0EE] hover:border-[#D4D4D4]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Job Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                  Posisi / Judul Lowongan
                </label>
                <input
                  type="text"
                  required
                  value={formData.job_title || ''}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Contoh: Frontend Developer"
                  className="w-full px-3 py-2 text-xs border border-[#EAEAEA] rounded-md bg-[#FBFBFA] focus:bg-white focus:border-[#111111] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                  Nama Perusahaan
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Contoh: PT Bank BCA Tbk"
                  className="w-full px-3 py-2 text-xs border border-[#EAEAEA] rounded-md bg-[#FBFBFA] focus:bg-white focus:border-[#111111] outline-none"
                />
              </div>
            </div>

            {/* Location & Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full px-3 py-2 text-xs border border-[#EAEAEA] rounded-md bg-[#FBFBFA] focus:bg-white focus:border-[#111111] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                  Rentang Gaji (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.salary_range || ''}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  placeholder="Contoh: Rp 8 - 12 Jt"
                  className="w-full px-3 py-2 text-xs border border-[#EAEAEA] rounded-md bg-[#FBFBFA] focus:bg-white focus:border-[#111111] outline-none font-mono"
                />
              </div>
            </div>

            {/* URL Lowongan */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                URL Lowongan KarirHub
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.job_url || ''}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                  placeholder="https://karirhub.kemnaker.go.id/vacancies/..."
                  className="flex-1 px-3 py-2 text-xs border border-[#EAEAEA] rounded-md bg-[#FBFBFA] focus:bg-white focus:border-[#111111] outline-none font-mono"
                />
                {formData.job_url && (
                  <a
                    href={formData.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs border border-[#EAEAEA] rounded-md bg-[#F7F6F3] text-[#111111] hover:bg-[#EAEAEA] flex items-center justify-center cursor-pointer"
                    title="Buka Tautan Lowongan"
                  >
                    <IconExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Interview Schedule (if status === 'interview') */}
            {formData.status === 'interview' && (
              <div className="p-3 bg-[#E1F3FE]/40 border border-[#CAE7FC] rounded-md space-y-2">
                <label className="block text-[11px] font-semibold text-[#1F6C9F] uppercase tracking-wider">
                  Jadwal Interview / Wawancara
                </label>
                <input
                  type="datetime-local"
                  value={formData.interview_date ? formData.interview_date.slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#CAE7FC] rounded-md bg-white font-mono text-[#1F6C9F] outline-none"
                />
              </div>
            )}

            {/* Notes / Interview Prep */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                Catatan & Persiapan Wawancara
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tuliskan catatan teknis, link meeting Google Meet / Zoom, pertanyaan HR, dll."
                className="w-full px-3 py-2 text-xs border border-[#EAEAEA] rounded-md bg-[#FBFBFA] focus:bg-white focus:border-[#111111] outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Modal Footer - Fixed at bottom */}
          <div className="px-6 py-3.5 border-t border-[#EAEAEA] bg-[#FBFBFA] flex items-center justify-between shrink-0">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin ingin menghapus lamaran ini?')) {
                    onDelete(application.id);
                    onClose();
                  }
                }}
                className="text-xs text-[#9F2F2D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconTrash className="w-3.5 h-3.5" />
                <span>Hapus Lamaran</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {isEditing ? 'Simpan Perubahan' : 'Tambah Lamaran'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
