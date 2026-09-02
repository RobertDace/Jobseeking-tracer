'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import MetricCards from '@/components/MetricCards';
import KanbanBoard from '@/components/KanbanBoard';
import TableView from '@/components/TableView';
import ApplicationModal from '@/components/ApplicationModal';
import ExtensionGuideModal from '@/components/ExtensionGuideModal';
import BatchImportModal from '@/components/BatchImportModal';
import StatusBadge from '@/components/StatusBadge';
import { JobApplication, ApplicationStats, ApplicationStatus } from '@/lib/types';
import { IconSearch, IconRefresh } from '@/components/icons';

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    interview: 0,
    rejected: 0,
    offered: 0,
    responseRate: 0,
    interviewRate: 0,
  });

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);
  const [activeModalApp, setActiveModalApp] = useState<JobApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExtensionGuideOpen, setIsExtensionGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Show Toast
  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      showToast('Gagal memuat data lamaran', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Extension Bridge Listeners for Realtime Sync
  useEffect(() => {
    fetchApplications();
    // Auto-refresh interval every 15s to catch new applications pushed by extension
    const interval = setInterval(fetchApplications, 15000);

    // Detect if extension companion bridge is active
    if (typeof window !== 'undefined') {
      if (document.documentElement.getAttribute('data-jobtracer-extension') === 'true') {
        setHasExtension(true);
      }

      const onExtReady = () => setHasExtension(true);
      const onSyncComplete = (e: Event) => {
        const customEvent = e as CustomEvent;
        setIsSyncing(false);
        const detail = customEvent.detail;
        if (detail && detail.success) {
          showToast(detail.message || 'Sinkronisasi status KarirHub selesai!');
          fetchApplications();
        } else {
          showToast(detail?.message || 'Pemeriksaan status KarirHub selesai.');
          fetchApplications();
        }
      };

      window.addEventListener('jobtracer:extension-ready', onExtReady);
      window.addEventListener('jobtracer:sync-complete', onSyncComplete);

      return () => {
        clearInterval(interval);
        window.removeEventListener('jobtracer:extension-ready', onExtReady);
        window.removeEventListener('jobtracer:sync-complete', onSyncComplete);
      };
    }

    return () => clearInterval(interval);
  }, [fetchApplications, showToast]);

  // Trigger background sync across KarirHub applications
  const handleTriggerSync = () => {
    setIsSyncing(true);
    showToast('Memeriksa status lowongan di KarirHub di background...');
    window.dispatchEvent(new CustomEvent('jobtracer:trigger-sync'));

    // Safety timeout in case extension takes time
    setTimeout(() => {
      setIsSyncing(false);
      fetchApplications();
    }, 18000);
  };

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app))
    );

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Status berhasil diperbarui.`);
        fetchApplications();
      } else {
        throw new Error('Gagal memperbarui status');
      }
    } catch {
      showToast('Gagal memperbarui status di server', 'error');
      fetchApplications();
    }
  };

  // Save (Create or Update)
  const handleSaveApplication = async (data: Partial<JobApplication>) => {
    try {
      if (activeModalApp) {
        // Edit existing
        const res = await fetch(`/api/applications/${activeModalApp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          showToast('Data lamaran berhasil disimpan');
          fetchApplications();
        }
      } else {
        // Create new
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          showToast('Lamaran baru berhasil ditambahkan');
          fetchApplications();
        }
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan data', 'error');
    }
  };

  // Delete
  const handleDeleteApplication = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Lamaran berhasil dihapus');
        fetchApplications();
      }
    } catch {
      showToast('Gagal menghapus lamaran', 'error');
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesStatus = !selectedStatus || app.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-[#EAEAEA] selection:text-[#111111]">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
          <div
            className={`px-4 py-3 rounded-md shadow-lg border text-xs font-medium flex items-center gap-2 pointer-events-auto ${
              toastMessage.type === 'error'
                ? 'bg-[#FDEBEC] text-[#9F2F2D] border-[#F8D3D6]'
                : 'bg-[#111111] text-white border-[#111111]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAddModal={() => {
          setActiveModalApp(null);
          setIsModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onRefresh={fetchApplications}
        isRefreshing={isRefreshing}
        onOpenExtensionGuide={() => setIsExtensionGuideOpen(true)}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        hasExtension={hasExtension}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* Metric Cards Bento Grid */}
        <MetricCards
          stats={stats}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        {/* Filter bar & Quick Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#787774] mr-1">
              Filter Status:
            </span>
            <button
              onClick={() => setSelectedStatus(null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                selectedStatus === null
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#787774] border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'pending' ? null : 'pending')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                selectedStatus === 'pending'
                  ? 'bg-[#FBF3DB] text-[#956400] border-[#F3E7C4] font-semibold'
                  : 'bg-white text-[#787774] border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              Menunggu ({stats.pending})
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'interview' ? null : 'interview')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                selectedStatus === 'interview'
                  ? 'bg-[#E1F3FE] text-[#1F6C9F] border-[#CAE7FC] font-semibold'
                  : 'bg-white text-[#787774] border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              Interview ({stats.interview})
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'rejected' ? null : 'rejected')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                selectedStatus === 'rejected'
                  ? 'bg-[#FDEBEC] text-[#9F2F2D] border-[#F8D3D6] font-semibold'
                  : 'bg-white text-[#787774] border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              Ditolak ({stats.rejected})
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'offered' ? null : 'offered')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                selectedStatus === 'offered'
                  ? 'bg-[#EDF3EC] text-[#346538] border-[#D7E7D5] font-semibold'
                  : 'bg-white text-[#787774] border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              Diterima ({stats.offered})
            </button>
          </div>

          <div className="text-xs text-[#787774] font-mono">
            Menampilkan {filteredApps.length} dari {applications.length} lowongan
          </div>
        </div>

        {/* View Component */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            applications={filteredApps}
            onSelectApp={(app) => {
              setActiveModalApp(app);
              setIsModalOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
            onDeleteApp={handleDeleteApplication}
          />
        ) : (
          <TableView
            applications={filteredApps}
            onSelectApp={(app) => {
              setActiveModalApp(app);
              setIsModalOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
            onDeleteApp={handleDeleteApplication}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAEAEA] bg-white mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#787774]">
          <div>
            JobTracer · Utilitarian Minimalism Edition · Terintegrasi dengan KarirHub Kemnaker
          </div>
          <div className="flex items-center gap-4">
            <span>Local API: <code className="font-mono text-[#111111]">localhost:3000/api</code></span>
            <button
              onClick={() => setIsExtensionGuideOpen(true)}
              className="text-[#111111] hover:underline"
            >
              Bantuan Ekstensi
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveModalApp(null);
        }}
        application={activeModalApp}
        onSave={handleSaveApplication}
        onDelete={handleDeleteApplication}
      />

      <BatchImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          showToast('Daftar lamaran lama berhasil diimpor!');
          fetchApplications();
        }}
      />

      <ExtensionGuideModal
        isOpen={isExtensionGuideOpen}
        onClose={() => setIsExtensionGuideOpen(false)}
      />
    </div>
  );
}
