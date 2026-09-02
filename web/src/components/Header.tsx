import React from 'react';
import { IconKanban, IconTable, IconPlus, IconDownload, IconRefresh, IconSearch } from './icons';

interface HeaderProps {
  viewMode: 'kanban' | 'table';
  setViewMode: (mode: 'kanban' | 'table') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenExtensionGuide: () => void;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
  hasExtension?: boolean;
}

export default function Header({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onOpenImportModal,
  onRefresh,
  isRefreshing,
  onOpenExtensionGuide,
  onTriggerSync,
  isSyncing = false,
  hasExtension = false,
}: HeaderProps) {
  return (
    <header className="border-b border-[#EAEAEA] bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Top line: Brand & Extension Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-[#111111]">
                  JobTracer
                </h1>
                <span className="text-[10px] font-mono uppercase bg-[#F7F6F3] border border-[#EAEAEA] text-[#787774] px-1.5 py-0.5 rounded">
                  KarirHub Edition
                </span>
              </div>
              <p className="text-xs text-[#787774] mt-0.5">
                Pelacak otomatis lamaran kerja KarirHub Kemnaker & manajemen status wawancara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Realtime Background Auto-Sync Trigger */}
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isSyncing
                  ? 'bg-[#FBF3DB] text-[#956400] border-[#F3E7C4] animate-pulse'
                  : 'bg-[#FBFBFA] text-[#111111] border-[#EAEAEA] hover:border-[#111111]'
              }`}
              title="Periksa perubahan status lowongan KarirHub secara background tanpa harus buka web KarirHub"
            >
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-[#956400]' : 'bg-[#346538]'}`} />
              <span>{isSyncing ? 'Memeriksa KarirHub...' : '🔄 Cek Status Realtime'}</span>
            </button>

            {/* Companion Extension Helper Button */}
            <button
              onClick={onOpenExtensionGuide}
              className="px-3 py-1.5 rounded-full border border-[#EAEAEA] bg-[#FBFBFA] hover:bg-[#F0F0EE] transition-colors flex items-center gap-2 text-xs text-[#111111] cursor-pointer"
              title="Panduan Pemasangan Chrome Extension"
            >
              <span className="w-2 h-2 rounded-full bg-[#346538] animate-pulse" />
              <span className="font-medium">Extension v1.1</span>
            </button>

            {/* Impor Massal Lamaran Lama */}
            <button
              onClick={onOpenImportModal}
              className="btn-secondary text-xs py-1.5 px-3"
              title="Impor lowongan yang sudah Anda daftar sebelumnya"
            >
              <span>📥 Impor Riwayat</span>
            </button>

            {/* Export Data */}
            <a
              href="/api/export?format=csv"
              download
              className="btn-secondary text-xs py-1.5 px-3"
              title="Unduh data lamaran format CSV"
            >
              <IconDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>

            {/* Tambah Lamaran Manual */}
            <button
              onClick={onOpenAddModal}
              className="btn-primary text-xs py-1.5 px-3.5"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Tambah Manual</span>
            </button>
          </div>
        </div>

        {/* Bottom line: Search, Filters, & View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <IconSearch className="w-4 h-4 text-[#787774] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari perusahaan, posisi, atau lokasi..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#FBFBFA] border border-[#EAEAEA] rounded-md focus:bg-white focus:border-[#111111] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#787774] hover:text-[#111111]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right controls: View mode switcher & Refresh */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center border border-[#EAEAEA] rounded-md bg-[#FBFBFA] p-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'text-[#787774] hover:text-[#111111]'
                }`}
              >
                <IconKanban className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'text-[#787774] hover:text-[#111111]'
                }`}
              >
                <IconTable className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 border border-[#EAEAEA] rounded-md bg-[#FBFBFA] hover:bg-[#F0F0EE] text-[#787774] hover:text-[#111111] transition-colors"
              title="Refresh Data"
            >
              <IconRefresh className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#111111]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
