// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/modules/en13813/services/audit.service';
import type { Database } from '@/types/database.types';

const auditService = new AuditService();

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get current user and tenant
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get tenant from user's metadata
    const tenantId = user.user_metadata?.tenant_id || 'demo-tenant-id';

    // Get days parameter from query string
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;

    const audits = await auditService.getUpcomingAudits(tenantId, days);

    return NextResponse.json(audits);
  } catch (error) {
    console.error('Error fetching upcoming audits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}