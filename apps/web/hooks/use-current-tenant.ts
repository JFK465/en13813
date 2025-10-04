import { useEffect, useState } from 'react';
import { getSupabaseSingleton } from '@/lib/supabase/singleton-client';

interface Tenant {
  id: string;
  name: string;
  slug?: string;
  status?: 'trial' | 'active' | 'suspended' | 'canceled';
  created_at?: string;
  updated_at?: string;
}

// Use the actual demo tenant ID from the database
const DEMO_TENANT_ID = '123e4567-e89b-12d3-a456-426614174000';

export function useCurrentTenant() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseSingleton();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function loadTenant() {
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.warn('Tenant loading timeout - using demo tenant');
          setCurrentTenant({
            id: DEMO_TENANT_ID,
            name: 'Demo Company GmbH',
            slug: 'demo-company',
            status: 'active'
          });
          setLoading(false);
        }
      }, 5000); // 5 second timeout

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            // No user - use demo tenant for development
            console.log('No user found, using demo tenant');
            setCurrentTenant({
              id: DEMO_TENANT_ID,
              name: 'Demo Company GmbH',
              slug: 'demo',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            setLoading(false);
          }
          return;
        }

        // Priority 1: Check app_metadata (most secure, set server-side)
        const tenantId = user.app_metadata?.tenant_id;

        if (tenantId) {
          // Load full tenant details
          const { data: tenant, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();

          if (!error && tenant && mounted) {
            setCurrentTenant(tenant);
            setLoading(false);
            clearTimeout(timeoutId);
            return;
          }
        }

        // Priority 2: Check tenant_users table
        const { data: tenantUser, error: tuError } = await supabase
          .from('tenant_users')
          .select(`
            tenant_id,
            role,
            tenants!inner (
              id,
              name,
              slug,
              status
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (!tuError && tenantUser?.tenants && mounted) {
          const tenant = tenantUser.tenants as unknown as Tenant;
          setCurrentTenant(tenant);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        // Priority 3: Use demo tenant as fallback
        console.warn('No tenant found for user, using demo tenant');
        if (mounted) {
          setCurrentTenant({
            id: DEMO_TENANT_ID,
            name: 'Demo Company GmbH',
            slug: 'demo-company',
            status: 'active'
          });
          setLoading(false);
        }

      } catch (error) {
        console.error('Error in loadTenant:', error);
        if (mounted) {
          // Error fallback - use demo tenant
          setCurrentTenant({
            id: DEMO_TENANT_ID,
            name: 'Demo Company GmbH',
            slug: 'demo-company',
            status: 'active'
          });
          setLoading(false);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    loadTenant();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (mounted) {
        loadTenant();
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  return {
    currentTenant,
    isLoading: loading,
    loading, // Keep for backwards compatibility
    tenantId: currentTenant?.id || DEMO_TENANT_ID
  };
}