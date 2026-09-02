import fs from 'fs';
import path from 'path';
import { JobApplication, ApplicationStats, ApplicationStatus } from './types';

const isVercel = process.env.VERCEL === '1';
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'applications.json');
const DATA_DIR = isVercel ? path.join('/tmp', 'jobtracer') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'applications.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }
}

// Initial realistic data from KarirHub Kemnaker
const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'kh-2026-001',
    company_name: 'PT Telkom Indonesia (Persero) Tbk',
    job_title: 'Full Stack Web Developer',
    location: 'Jakarta Selatan, DKI Jakarta',
    salary_range: 'Rp 9.000.000 - Rp 14.000.000',
    job_url: 'https://karirhub.kemnaker.go.id/vacancies/telkom-fullstack-dev',
    source: 'karirhub',
    status: 'interview',
    applied_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Panggilan Interview User & Live Coding via Google Meet, Rabu pkl 10:00 WIB. Materi: Next.js, REST API, & Database.',
    interview_date: '2026-09-09T10:00:00+07:00',
    tags: ['BUMN', 'Full Stack', 'Next.js']
  },
  {
    id: 'kh-2026-002',
    company_name: 'PT Bank Central Asia Tbk (BCA)',
    job_title: 'Frontend Engineer',
    location: 'Jakarta Barat, DKI Jakarta',
    salary_range: 'Rp 10.000.000 - Rp 16.000.000',
    job_url: 'https://karirhub.kemnaker.go.id/vacancies/bca-frontend-engineer',
    source: 'karirhub',
    status: 'pending',
    applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Lamaran otomatis terkirim melalui KarirHub Kemnaker. Menunggu seleksi berkas HRD.',
    tags: ['Banking', 'Frontend', 'TypeScript']
  },
  {
    id: 'kh-2026-003',
    company_name: 'PT Astra International Tbk',
    job_title: 'Software Developer Specialist',
    location: 'Jakarta Utara, DKI Jakarta',
    salary_range: 'Rp 8.500.000 - Rp 13.000.000',
    job_url: 'https://karirhub.kemnaker.go.id/vacancies/astra-software-dev',
    source: 'karirhub',
    status: 'pending',
    applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Lamaran dalam tahap verifikasi portofolio.',
    tags: ['Automotive', 'Web']
  }
];

// Helper to clean company name
function sanitizeCompanyName(name: string, jobTitle: string): string {
  if (!name) return 'Perusahaan KarirHub';
  let cleaned = name.trim();

  // Strip modal prefix if accidentally captured
  if (/^konfirmasi\s+melamar\s+lowongan:?/i.test(cleaned)) {
    cleaned = cleaned.replace(/^konfirmasi\s+melamar\s+lowongan:?\s*/i, '').trim();
    // If it equals job title, fallback
    if (cleaned.toLowerCase() === jobTitle.toLowerCase() || cleaned.length < 3) {
      return 'Perusahaan KarirHub';
    }
  }

  // Reject accidental sentence matching
  if (/^pt\s+to\s+/i.test(cleaned) || /passionate\s+to/i.test(cleaned) || cleaned.length > 70) {
    return 'Perusahaan KarirHub';
  }

  return cleaned;
}

// Clean URL helper for matching
function cleanUrl(url?: string): string {
  if (!url) return '';
  return url.split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
}

// Helper to read DB
export function readDatabase(): JobApplication[] {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      try {
        const bundledRaw = fs.readFileSync(BUNDLED_DB_FILE, 'utf8');
        const bundledApps = JSON.parse(bundledRaw) as JobApplication[];
        fs.writeFileSync(DB_FILE, JSON.stringify(bundledApps, null, 2), 'utf8');
        return bundledApps;
      } catch {
        // fallback
      }
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_APPLICATIONS, null, 2), 'utf8');
    return INITIAL_APPLICATIONS;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as JobApplication[];
  } catch (err) {
    console.error('Failed reading database file, returning fallback:', err);
    return INITIAL_APPLICATIONS;
  }
}

// Helper to write DB safely on Windows
export function writeDatabase(applications: JobApplication[]): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(applications, null, 2), 'utf8');
}

// Queries & Mutations
export function getAllApplications(): JobApplication[] {
  const apps = readDatabase();
  return apps.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
}

export function getApplicationById(id: string): JobApplication | null {
  const apps = readDatabase();
  return apps.find(a => a.id === id) || null;
}

export function createApplication(data: Omit<JobApplication, 'id' | 'applied_at' | 'updated_at'>): JobApplication {
  const apps = readDatabase();
  const now = new Date().toISOString();

  const sanitizedCompany = sanitizeCompanyName(data.company_name, data.job_title);
  const targetUrl = cleanUrl(data.job_url);
  const targetTitle = data.job_title.toLowerCase().trim();

  // 1. Check duplicate by identical job_url (Most accurate for KarirHub vacancy links)
  let existingIndex = -1;
  if (targetUrl && !targetUrl.endsWith('karirhub.kemnaker.go.id')) {
    existingIndex = apps.findIndex(a => cleanUrl(a.job_url) === targetUrl);
  }

  // 2. Fallback check: matching job title created within last 24 hours
  if (existingIndex === -1) {
    existingIndex = apps.findIndex(a => {
      const isSameTitle = a.job_title.toLowerCase().trim() === targetTitle;
      const isRecent = Math.abs(new Date(now).getTime() - new Date(a.applied_at).getTime()) < 24 * 60 * 60 * 1000;
      return isSameTitle && isRecent;
    });
  }

  if (existingIndex !== -1) {
    const existing = apps[existingIndex];
    existing.updated_at = now;

    // Update status if a more up-to-date status is provided
    if (data.status && existing.status !== data.status) {
      existing.status = data.status;
    }

    // Upgrade existing data with better values if available
    if (sanitizedCompany !== 'Perusahaan KarirHub') {
      existing.company_name = sanitizedCompany;
    }
    if (data.salary_range && data.salary_range !== 'Dirahasiakan') {
      existing.salary_range = data.salary_range;
    } else if (!existing.salary_range) {
      existing.salary_range = data.salary_range || 'Dirahasiakan';
    }
    if (data.location && data.location !== 'Indonesia') {
      existing.location = data.location;
    }
    if (data.job_url && !existing.job_url) {
      existing.job_url = data.job_url;
    }

    writeDatabase(apps);
    return existing;
  }

  const newApp: JobApplication = {
    id: `kh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...data,
    company_name: sanitizedCompany,
    status: data.status || 'pending',
    applied_at: now,
    updated_at: now,
  };

  apps.unshift(newApp);
  writeDatabase(apps);
  return newApp;
}

export function updateApplication(id: string, updates: Partial<JobApplication>): JobApplication | null {
  const apps = readDatabase();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) return null;

  const current = apps[index];
  const updated: JobApplication = {
    ...current,
    ...updates,
    id: current.id,
    updated_at: new Date().toISOString()
  };

  apps[index] = updated;
  writeDatabase(apps);
  return updated;
}

export function deleteApplication(id: string): boolean {
  const apps = readDatabase();
  const filtered = apps.filter(a => a.id !== id);
  if (filtered.length === apps.length) return false;

  writeDatabase(filtered);
  return true;
}

// Batch Sync from KarirHub "Lamaran Saya" page
export function batchSyncApplications(items: Array<{
  company_name: string;
  job_title: string;
  status: ApplicationStatus;
  job_url?: string;
  source?: 'karirhub' | 'manual';
}>): { updatedCount: number; createdCount: number } {
  const apps = readDatabase();
  let updatedCount = 0;
  let createdCount = 0;
  const now = new Date().toISOString();

  for (const item of items) {
    const compLower = item.company_name.toLowerCase().trim();
    const titleLower = item.job_title.toLowerCase().trim();
    const targetUrl = cleanUrl(item.job_url);

    // Match by URL first, or company & title
    const match = apps.find(a => {
      if (targetUrl && cleanUrl(a.job_url) === targetUrl) return true;
      return (
        (a.company_name.toLowerCase().includes(compLower) || compLower.includes(a.company_name.toLowerCase())) &&
        (a.job_title.toLowerCase().includes(titleLower) || titleLower.includes(a.job_title.toLowerCase()))
      );
    });

    if (match) {
      if (match.status !== item.status) {
        match.status = item.status;
        match.updated_at = now;
        updatedCount++;
      }
    } else {
      const newApp: JobApplication = {
        id: `kh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        company_name: sanitizeCompanyName(item.company_name, item.job_title),
        job_title: item.job_title,
        location: 'Indonesia',
        job_url: item.job_url || 'https://karirhub.kemnaker.go.id',
        source: 'karirhub',
        status: item.status || 'pending',
        applied_at: now,
        updated_at: now,
        notes: 'Disinkronkan otomatis dari riwayat Lamaran Saya KarirHub'
      };
      apps.unshift(newApp);
      createdCount++;
    }
  }

  writeDatabase(apps);
  return { updatedCount, createdCount };
}

// Compute statistics
export function getStats(): ApplicationStats {
  const apps = readDatabase();
  const total = apps.length;
  const pending = apps.filter(a => a.status === 'pending').length;
  const interview = apps.filter(a => a.status === 'interview').length;
  const rejected = apps.filter(a => a.status === 'rejected').length;
  const offered = apps.filter(a => a.status === 'offered').length;

  const responded = interview + rejected + offered;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const interviewRate = total > 0 ? Math.round((interview / total) * 100) : 0;

  return {
    total,
    pending,
    interview,
    rejected,
    offered,
    responseRate,
    interviewRate
  };
}
