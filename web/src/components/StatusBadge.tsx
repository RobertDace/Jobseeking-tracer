import React from 'react';
import { ApplicationStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string; dotClass: string }> = {
  pending: {
    label: 'Menunggu Balasan',
    className: 'badge-pending',
    dotClass: 'bg-[#956400]'
  },
  interview: {
    label: 'Panggilan Interview',
    className: 'badge-interview',
    dotClass: 'bg-[#1F6C9F]'
  },
  rejected: {
    label: 'Ditolak',
    className: 'badge-rejected',
    dotClass: 'bg-[#9F2F2D]'
  },
  offered: {
    label: 'Diterima / Offering',
    className: 'badge-offered',
    dotClass: 'bg-[#346538]'
  }
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';

  return (
    <span className={`badge-status ${config.className} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
