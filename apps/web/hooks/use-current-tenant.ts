import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  created_at?: string;
}

export function useCurrentTenant() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadTenant() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setCurrentTenant(null);
          setLoading(false);
          return;
        }

        const { data: tenantUser } = await supabase
          .from('tenant_users')
          .select('tenant_id, tenants(id, name, subdomain)')
          .eq('user_id', user.id)
          .single();

        if (tenantUser && tenantUser.tenants) {
          const tenantData = tenantUser.tenants as any;
          if (Array.isArray(tenantData)) {
            setCurrentTenant(tenantData[0] as Tenant);
          } else {
            setCurrentTenant(tenantData as Tenant);
          }
        }
      } catch (error) {
        console.error('Error loading tenant:', error);
        setCurrentTenant(null);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, []);

  return { currentTenant, loading };
}