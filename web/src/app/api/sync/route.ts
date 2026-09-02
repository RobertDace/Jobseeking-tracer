import { NextRequest, NextResponse } from 'next/server';
import { batchSyncApplications, getStats } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Daftar item sinkronisasi kosong' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { updatedCount, createdCount } = batchSyncApplications(items);
    const stats = getStats();

    return NextResponse.json(
      {
        success: true,
        message: `Berhasil menyinkronkan: ${updatedCount} status diperbarui, ${createdCount} lamaran baru ditambahkan.`,
        updatedCount,
        createdCount,
        stats
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal sinkronisasi' },
      { status: 500, headers: corsHeaders }
    );
  }
}
