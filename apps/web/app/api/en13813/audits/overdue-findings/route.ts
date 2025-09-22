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

    const findings = await auditService.getOverdueFindings(tenantId);

    return NextResponse.json(findings);
  } catch (error) {
    console.error('Error fetching overdue findings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}