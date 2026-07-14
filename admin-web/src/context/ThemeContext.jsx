import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const DEFAULT_BRANDING = {
  instituteName: 'Coaching Platform',
  displayName: '',
  tagline: '',
  logoUrl: '',
  bannerImageUrl: '',
  faviconUrl: '',
  primaryColor: '#2563EB',
  secondaryColor: '#1E40AF',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  aboutText: '',
  socialLinks: { website: '', instagram: '', facebook: '', youtube: '' },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    if (!user?.instituteId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axiosInstance.get(`/institutes/${user.instituteId}/branding`);
      setBranding({ ...DEFAULT_BRANDING, ...data.data });
    } catch (err) {
      // fall back to defaults silently — never break the UI over missing branding
      console.error('Failed to load branding', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  // apply favicon dynamically whenever branding changes
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = branding.faviconUrl || '/vite.svg';
    document.head.appendChild(link);
    document.title = branding.displayName || branding.instituteName || 'Coaching Platform';
  }, [branding.faviconUrl, branding.displayName, branding.instituteName]);

  return (
    <ThemeContext.Provider value={{ branding, refreshBranding: fetchBranding, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);