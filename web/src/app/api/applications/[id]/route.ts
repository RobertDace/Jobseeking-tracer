import { NextRequest, NextResponse } from 'next/server';
import { getApplicationById, updateApplication, deleteApplication } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = getApplicationById(id);
  if (!app) {
    return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }
  return NextResponse.json({ success: true, application: app }, { headers: corsHeaders });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateApplication(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Lamaran tidak ditemukan' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, application: updated }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteApplication(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Lamaran tidak ditemukan' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, message: 'Lamaran berhasil dihapus' }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
