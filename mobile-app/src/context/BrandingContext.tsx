import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

type Branding = {
  instituteName: string;
  displayName: string;
  tagline: string;
  logoUrl: string;
  bannerImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  aboutText: string;
  socialLinks: { website: string; instagram: string; facebook: string; youtube: string };
};

const DEFAULT_BRANDING: Branding = {
  instituteName: 'Coaching Platform',
  displayName: '',
  tagline: '',
  logoUrl: '',
  bannerImageUrl: '',
  primaryColor: '#2563EB',
  secondaryColor: '#1E40AF',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  aboutText: '',
  socialLinks: { website: '', instagram: '', facebook: '', youtube: '' },
};

type BrandingContextType = {
  branding: Branding;
  refreshBranding: () => Promise<void>;
  loading: boolean;
};

const BrandingContext = createContext<BrandingContextType | null>(null);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    try {
      // fall back to cached branding (from a previous session) if fetch fails —
      // e.g. slow/offline app open, so the boot loader logo still shows something branded
      const cached = await SecureStore.getItemAsync('branding');
      if (cached) setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(cached) });

      if (!user?.instituteId) {
        setLoading(false);
        return;
      }

      const { data } = await axiosInstance.get(`/institutes/${user.instituteId}/branding`);
      const merged = { ...DEFAULT_BRANDING, ...data.data };
      setBranding(merged);
      await SecureStore.setItemAsync('branding', JSON.stringify(merged));
    } catch (err) {
      console.error('Failed to load branding', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding: fetchBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
};

// Standalone helper for the boot screen — reads cached branding directly from
// SecureStore without needing the full context/provider tree mounted yet.
export const getCachedBranding = async (): Promise<Branding> => {
  try {
    const cached = await SecureStore.getItemAsync('branding');
    if (cached) return { ...DEFAULT_BRANDING, ...JSON.parse(cached) };
  } catch (err) {
    // ignore — fall through to default
  }
  return DEFAULT_BRANDING;
};