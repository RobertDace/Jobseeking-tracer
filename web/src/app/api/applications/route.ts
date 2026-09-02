import { NextRequest, NextResponse } from 'next/server';
import { getAllApplications, createApplication, getStats } from '@/lib/db';
import { ApplicationStatus } from '@/lib/types';

// CORS headers helper for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ApplicationStatus | null;
    const q = searchParams.get('q')?.toLowerCase() || '';

    let apps = getAllApplications();

    if (status && ['pending', 'interview', 'rejected', 'offered'].includes(status)) {
      apps = apps.filter(a => a.status === status);
    }

    if (q) {
      apps = apps.filter(a => 
        a.company_name.toLowerCase().includes(q) ||
        a.job_title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    const stats = getStats();

    return NextResponse.json(
      { success: true, count: apps.length, applications: apps, stats },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.company_name || !body.job_title) {
      return NextResponse.json(
        { success: false, message: 'Nama perusahaan dan judul lowongan wajib diisi' },
        { status: 400, headers: corsHeaders }
      );
    }

    const application = createApplication({
      company_name: body.company_name.trim(),
      job_title: body.job_title.trim(),
      location: body.location || 'Indonesia',
      salary_range: body.salary_range || '',
      job_url: body.job_url || 'https://karirhub.kemnaker.go.id',
      source: body.source || 'karirhub',
      status: body.status || 'pending',
      notes: body.notes || 'Lamaran otomatis terekam dari KarirHub Kemnaker',
      tags: body.tags || ['KarirHub']
    });

    return NextResponse.json(
      { success: true, message: 'Lamaran berhasil dicatat', application },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan lamaran' },
      { status: 500, headers: corsHeaders }
    );
  }
}
