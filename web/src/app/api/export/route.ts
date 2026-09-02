import { NextRequest, NextResponse } from 'next/server';
import { getAllApplications } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const apps = getAllApplications();

  if (format === 'csv') {
    const headers = ['ID', 'Perusahaan', 'Posisi', 'Status', 'Lokasi', 'Gaji', 'Tanggal Lamar', 'Catatan', 'URL Lowongan'];
    const rows = apps.map(a => [
      `"${a.id}"`,
      `"${a.company_name.replace(/"/g, '""')}"`,
      `"${a.job_title.replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.location.replace(/"/g, '""')}"`,
      `"${(a.salary_range || '').replace(/"/g, '""')}"`,
      `"${a.applied_at}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${a.job_url}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="karirhub-job-tracker-${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  }

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    total: apps.length,
    applications: apps
  });
}
