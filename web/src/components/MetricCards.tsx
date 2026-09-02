import React from 'react';
import { ApplicationStats } from '@/lib/types';

interface MetricCardsProps {
  stats: ApplicationStats;
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
}

export default function MetricCards({ stats, selectedStatus, onSelectStatus }: MetricCardsProps) {
  const cards = [
    {
      id: null,
      title: 'Total Lamaran',
      value: stats.total,
      sublabel: 'Semua lowongan aktif',
      indicatorColor: '#111111'
    },
    {
      id: 'pending',
      title: 'Menunggu Balasan',
      value: stats.pending,
      sublabel: `${stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% dari total`,
      indicatorColor: '#956400'
    },
    {
      id: 'interview',
      title: 'Panggilan Interview',
      value: stats.interview,
      sublabel: `${stats.interviewRate}% konversi interview`,
      indicatorColor: '#1F6C9F'
    },
    {
      id: 'rejected',
      title: 'Ditolak',
      value: stats.rejected,
      sublabel: `${stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% tidak lolos`,
      indicatorColor: '#9F2F2D'
    },
    {
      id: 'offered',
      title: 'Diterima / Penawaran',
      value: stats.offered,
      sublabel: `${stats.responseRate}% response rate`,
      indicatorColor: '#346538'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {cards.map((c) => {
        const isSelected = selectedStatus === c.id;
        return (
          <button
            key={c.title}
            onClick={() => onSelectStatus(isSelected && c.id !== null ? null : c.id)}
            className={`text-left p-4 rounded-lg bg-white border transition-all duration-150 relative cursor-pointer group ${
              isSelected
                ? 'border-[#111111] ring-1 ring-[#111111] bg-[#FAFAFA]'
                : 'border-[#EAEAEA] hover:border-[#D0D0D0] hover:bg-[#FDFDFD]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium tracking-wider uppercase text-[#787774]">
                {c.title}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: c.indicatorColor }}
              />
            </div>
            <div className="text-2xl font-semibold text-[#111111] font-mono tracking-tight mb-1">
              {c.value}
            </div>
            <div className="text-[11px] text-[#787774]">
              {c.sublabel}
            </div>
          </button>
        );
      })}
    </div>
  );
}
