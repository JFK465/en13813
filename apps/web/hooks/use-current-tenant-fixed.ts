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
          // For development/demo: Use a demo tenant
          console.log('🔧 No user found, using demo tenant');
          setCurrentTenant({
            id: 'demo-tenant-id',
            name: 'Demo Tenant',
            subdomain: 'demo'
          });
          setLoading(false);
          return;
        }

        // Try to load real tenant
        const { data: tenantUser, error } = await supabase
          .from('tenant_users')
          .select('tenant_id, tenants(id, name, subdomain)')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.warn('⚠️ Could not load tenant data:', error);
          // Fallback to user-based tenant ID
          setCurrentTenant({
            id: user.id, // Use user ID as tenant ID
            name: user.email?.split('@')[0] || 'Default Tenant',
            subdomain: 'default'
          });
        } else if (tenantUser && tenantUser.tenants) {
          const tenantData = tenantUser.tenants as any;
          if (Array.isArray(tenantData)) {
            setCurrentTenant(tenantData[0] as Tenant);
          } else {
            setCurrentTenant(tenantData as Tenant);
          }
        } else {
          // No tenant found, use user-based fallback
          setCurrentTenant({
            id: user.id,
            name: user.email?.split('@')[0] || 'Default Tenant',
            subdomain: 'default'
          });
        }
      } catch (error) {
        console.error('Error loading tenant:', error);
        // Final fallback: demo tenant
        setCurrentTenant({
          id: 'demo-tenant-id',
          name: 'Demo Tenant',
          subdomain: 'demo'
        });
      } finally {
        // WICHTIG: Always set loading to false!
        setLoading(false);
      }
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('⏱️ Tenant loading timeout, using fallback');
        setCurrentTenant({
          id: 'demo-tenant-id',
          name: 'Demo Tenant',
          subdomain: 'demo'
        });
        setLoading(false);
      }
    }, 3000); // 3 seconds timeout

    loadTenant();

    return () => clearTimeout(timeoutId);
  }, []);

  return { currentTenant, loading };
}