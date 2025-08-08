import { NextResponse } from 'next/server'
// In prod, fetch users & clothes from Supabase and create outfits.
export async function GET(){
  // placeholder: just returns ok
  return NextResponse.json({ ok: true, message: 'Saturday outfit cron executed (placeholder).' })
}
