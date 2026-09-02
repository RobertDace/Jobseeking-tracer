import React from 'react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { IconBuilding, IconMapPin, IconExternalLink, IconEdit, IconTrash } from './icons';

interface KanbanBoardProps {
  applications: JobApplication[];
  onSelectApp: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onDeleteApp: (id: string) => void;
}

const COLUMNS: { status: ApplicationStatus; title: string; countColor: string }[] = [
  { status: 'pending', title: 'Menunggu Balasan', countColor: 'text-[#956400] bg-[#FBF3DB]' },
  { status: 'interview', title: 'Panggilan Interview', countColor: 'text-[#1F6C9F] bg-[#E1F3FE]' },
  { status: 'rejected', title: 'Ditolak', countColor: 'text-[#9F2F2D] bg-[#FDEBEC]' },
  { status: 'offered', title: 'Diterima / Penawaran', countColor: 'text-[#346538] bg-[#EDF3EC]' },
];

function getDaysAgo(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hari ini';
    if (days === 1) return '1 hari lalu';
    return `${days} hari lalu`;
  } catch {
    return '';
  }
}

export default function KanbanBoard({
  applications,
  onSelectApp,
  onUpdateStatus,
  onDeleteApp
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((a) => a.status === col.status);

        return (
          <div
            key={col.status}
            className="bg-[#F7F6F3] rounded-lg border border-[#EAEAEA] p-3 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  {col.title}
                </span>
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${col.countColor}`}
                >
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Applications List */}
            <div className="flex flex-col gap-2.5 flex-1">
              {columnApps.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-[#E2E1DE] rounded-md text-center p-4">
                  <span className="text-xs text-[#787774]">Belum ada data</span>
                </div>
              ) : (
                columnApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-md border border-[#EAEAEA] p-3.5 hover:border-[#CCCCCC] transition-all duration-150 group shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                  >
                    {/* Header: Company & Days */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <IconBuilding className="w-3.5 h-3.5 text-[#787774] shrink-0" />
                        <span className="text-xs font-medium text-[#787774] truncate">
                          {app.company_name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#9B9A97] shrink-0">
                        {getDaysAgo(app.applied_at)}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h4
                      onClick={() => onSelectApp(app)}
                      className="text-[13px] font-semibold text-[#111111] cursor-pointer hover:text-[#0055FF] transition-colors leading-snug mb-2"
                    >
                      {app.job_title}
                    </h4>

                    {/* Location & Salary */}
                    <div className="space-y-1 mb-3 text-[11px] text-[#787774]">
                      <div className="flex items-center gap-1.5 truncate">
                        <IconMapPin className="w-3 h-3 text-[#9B9A97] shrink-0" />
                        <span className="truncate">{app.location}</span>
                      </div>
                      {app.salary_range && (
                        <div className="text-[11px] font-mono text-[#2F3437] truncate pl-4.5">
                          {app.salary_range}
                        </div>
                      )}
                    </div>

                    {/* Notes snippet if any */}
                    {app.notes && (
                      <div className="bg-[#FBFBFA] border border-[#EAEAEA] rounded p-2 text-[11px] text-[#555452] mb-3 line-clamp-2 leading-relaxed">
                        {app.notes}
                      </div>
                    )}

                    {/* Card Footer: Quick Actions */}
                    <div className="pt-2 border-t border-[#F0F0EE] flex items-center justify-between gap-2">
                      {/* Status Selector */}
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

                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#787774] hover:text-[#111111] rounded hover:bg-[#F7F6F3]"
                            title="Buka Lowongan di KarirHub"
                          >
                            <IconExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onSelectApp(app)}
                          className="p-1 text-[#787774] hover:text-[#111111] rounded hover:bg-[#F7F6F3]"
                          title="Edit Catatan"
                        >
                          <IconEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteApp(app.id)}
                          className="p-1 text-[#787774] hover:text-[#9F2F2D] rounded hover:bg-[#FDEBEC]"
                          title="Hapus"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
