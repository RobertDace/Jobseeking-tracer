import React from 'react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { IconBuilding, IconMapPin, IconExternalLink, IconEdit, IconTrash } from './icons';

interface TableViewProps {
  applications: JobApplication[];
  onSelectApp: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onDeleteApp: (id: string) => void;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return isoString;
  }
}

export default function TableView({
  applications,
  onSelectApp,
  onUpdateStatus,
  onDeleteApp
}: TableViewProps) {
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#EAEAEA] p-12 text-center text-[#787774]">
        Tidak ada data lamaran yang sesuai filter.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#EAEAEA] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#FBFBFA] text-[#787774] font-medium uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Posisi & Perusahaan</th>
              <th className="py-3 px-4">Status Lamaran</th>
              <th className="py-3 px-4">Lokasi & Gaji</th>
              <th className="py-3 px-4">Tanggal Lamar</th>
              <th className="py-3 px-4">Catatan</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {applications.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-[#FBFBFA] transition-colors duration-100 group"
              >
                {/* Job Title & Company */}
                <td className="py-3.5 px-4 max-w-[280px]">
                  <div
                    onClick={() => onSelectApp(app)}
                    className="font-semibold text-sm text-[#111111] hover:text-[#0055FF] cursor-pointer truncate mb-0.5"
                  >
                    {app.job_title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#787774] truncate">
                    <IconBuilding className="w-3.5 h-3.5 shrink-0 text-[#9B9A97]" />
                    <span className="truncate">{app.company_name}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} size="sm" />
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="text-[11px] bg-[#F7F6F3] border border-[#EAEAEA] rounded px-1.5 py-0.5 text-[#2F3437] font-medium outline-none cursor-pointer hover:bg-[#EFEFEA]"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Ditolak</option>
                      <option value="offered">Diterima</option>
                    </select>
                  </div>
                </td>

                {/* Location & Salary */}
                <td className="py-3.5 px-4 text-[#787774] max-w-[200px]">
                  <div className="flex items-center gap-1 truncate text-[11px]">
                    <IconMapPin className="w-3 h-3 shrink-0 text-[#9B9A97]" />
                    <span className="truncate">{app.location}</span>
                  </div>
                  {app.salary_range && (
                    <div className="text-[11px] font-mono text-[#2F3437] truncate mt-0.5">
                      {app.salary_range}
                    </div>
                  )}
                </td>

                {/* Applied Date */}
                <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#787774]">
                  {formatDate(app.applied_at)}
                </td>

                {/* Notes */}
                <td className="py-3.5 px-4 max-w-[240px]">
                  <div className="text-[11px] text-[#555452] truncate">
                    {app.notes || <span className="text-[#B0AEA9] italic">Tidak ada catatan</span>}
                  </div>
                  {app.interview_date && (
                    <div className="text-[10px] font-mono text-[#1F6C9F] mt-0.5">
                      Jadwal: {formatDate(app.interview_date)}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#787774] hover:text-[#111111] rounded hover:bg-[#F0F0EE]"
                        title="Buka Lowongan di KarirHub"
                      >
                        <IconExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onSelectApp(app)}
                      className="p-1.5 text-[#787774] hover:text-[#111111] rounded hover:bg-[#F0F0EE]"
                      title="Edit Detail"
                    >
                      <IconEdit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteApp(app.id)}
                      className="p-1.5 text-[#787774] hover:text-[#9F2F2D] rounded hover:bg-[#FDEBEC]"
                      title="Hapus"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
