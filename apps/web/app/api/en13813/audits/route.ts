import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auditSchema } from '@/modules/en13813/schemas/audit.schema';
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

    const audits = await auditService.getAudits(tenantId);

    return NextResponse.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = auditSchema.parse(body);

    const audit = await auditService.createAudit(validated, tenantId);

    return NextResponse.json(audit, { status: 201 });
  } catch (error: any) {
    console.error('Error creating audit:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}