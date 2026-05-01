import { NextResponse } from 'next/server';
import { config, getNairobiTime } from '@/lib/mission-control/config';

export const revalidate = 300;

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    nairobiTime: getNairobiTime(),
    profile: config.profile,
  });
}