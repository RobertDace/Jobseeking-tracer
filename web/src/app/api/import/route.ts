import { NextRequest, NextResponse } from 'next/server';
import { createApplication, getStats } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Convert slug to clean title (e.g. "security-operation-center-manager-8affe8bb" -> "Security Operation Center Manager")
function slugToTitle(slug: string): string {
  // Remove UUID or hash at the end if any
  const clean = slug.replace(/-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, '')
                    .replace(/-[a-f0-9]{6,}$/i, '');
  return clean.split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawText = body.text || '';
    const defaultStatus = body.status || 'pending';

    if (!rawText.trim()) {
      return NextResponse.json(
        { success: false, message: 'Teks input atau daftar link tidak boleh kosong' },
        { status: 400, headers: corsHeaders }
      );
    }

    const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const results = [];

    for (const line of lines) {
      let jobTitle = '';
      let companyName = 'Perusahaan KarirHub';
      let jobUrl = '';
      let location = 'Indonesia';
      let salaryRange = 'Dirahasiakan';

      // Check if line is a KarirHub URL
      if (/^https?:\/\//i.test(line)) {
        jobUrl = line;
        // Parse vacancy slug from URL
        const urlMatch = line.match(/\/lowongan\/([^\/\?#]+)/i) || line.match(/\/vacancies\/([^\/\?#]+)/i);
        if (urlMatch && urlMatch[1]) {
          jobTitle = slugToTitle(urlMatch[1]);
        } else {
          jobTitle = 'Lowongan KarirHub';
        }
      } else if (line.includes(' - ') || line.includes(' | ') || line.includes(',')) {
        // Format: "Posisi - Nama Perusahaan" or "Posisi, Perusahaan"
        const delimiter = line.includes(' - ') ? ' - ' : line.includes(' | ') ? ' | ' : ',';
        const parts = line.split(delimiter).map((p: string) => p.trim());
        jobTitle = parts[0] || 'Posisi Lowongan';
        companyName = parts[1] || 'Perusahaan KarirHub';
        if (parts[2]) location = parts[2];
      } else {
        jobTitle = line;
      }

      if (jobTitle) {
        const app = createApplication({
          company_name: companyName,
          job_title: jobTitle,
          location: location,
          salary_range: salaryRange,
          job_url: jobUrl || 'https://karirhub.kemnaker.go.id',
          source: 'karirhub',
          status: defaultStatus,
          notes: 'Diimpor otomatis dari daftar riwayat pendaftaran KarirHub Kemnaker'
        });
        results.push(app);
      }
    }

    const stats = getStats();

    return NextResponse.json(
      {
        success: true,
        message: `Berhasil mengimpor ${results.length} lowongan dengan status Menunggu Balasan!`,
        count: results.length,
        items: results,
        stats
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal mengimpor data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
