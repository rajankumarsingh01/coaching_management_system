import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const BrandingSettings = () => {
  const { user } = useAuth();
  const { branding, refreshBranding } = useTheme();
  const [form, setForm] = useState({
    displayName: '',
    tagline: '',
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    aboutText: '',
    socialLinks: { website: '', instagram: '', facebook: '', youtube: '' },
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (branding) {
      setForm({
        displayName: branding.displayName || '',
        tagline: branding.tagline || '',
        primaryColor: branding.primaryColor || '#2563EB',
        secondaryColor: branding.secondaryColor || '#1E40AF',
        contactPhone: branding.contactPhone || '',
        contactEmail: branding.contactEmail || '',
        contactAddress: branding.contactAddress || '',
        aboutText: branding.aboutText || '',
        socialLinks: branding.socialLinks || { website: '', instagram: '', facebook: '', youtube: '' },
      });
    }
  }, [branding]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSocialChange = (e) => {
    setForm({ ...form, socialLinks: { ...form.socialLinks, [e.target.name]: e.target.value } });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await axiosInstance.put(`/institutes/${user.instituteId}/branding`, form);

      if (logoFile) {
        const logoData = new FormData();
        logoData.append('file', logoFile);
        await axiosInstance.post(`/institutes/${user.instituteId}/branding/logo`, logoData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (bannerFile) {
        const bannerData = new FormData();
        bannerData.append('file', bannerFile);
        await axiosInstance.post(`/institutes/${user.instituteId}/branding/banner`, bannerData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setMessage('Branding updated successfully');
      setLogoFile(null);
      setBannerFile(null);
      refreshBranding();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update branding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Branding Settings</h1>
      <p className="mb-6 text-sm text-gray-500">
        Set up your institute's look — this is what your students and parents will see across the app.
      </p>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSave} className="space-y-4 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Display Name</label>
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="e.g. Sharma Coaching Classes"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tagline</label>
            <input
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="e.g. Bihar's Best Coaching for Class 10-12"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Primary Color</label>
              <input
                type="color"
                name="primaryColor"
                value={form.primaryColor}
                onChange={handleChange}
                className="h-10 w-full rounded border border-gray-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Secondary Color</label>
              <input
                type="color"
                name="secondaryColor"
                value={form.secondaryColor}
                onChange={handleChange}
                className="h-10 w-full rounded border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Logo (square, transparent bg recommended)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Banner Image (wide, home screen hero)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setBannerFile(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contact Phone</label>
            <input
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contact Address</label>
            <input
              name="contactAddress"
              value={form.contactAddress}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">About Text</label>
            <textarea
              name="aboutText"
              value={form.aboutText}
              onChange={handleChange}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <p className="text-sm font-medium text-gray-600">Social Links</p>
          {['website', 'instagram', 'facebook', 'youtube'].map((key) => (
            <input
              key={key}
              name={key}
              value={form.socialLinks[key]}
              onChange={handleSocialChange}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1) + ' URL'}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          ))}

          <button
            type="submit"
            disabled={saving}
            className="rounded px-6 py-2 font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: form.primaryColor }}
          >
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
        </form>

        {/* Live preview */}
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-3 text-sm font-medium text-gray-600">Live Preview</p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {branding?.bannerImageUrl && (
              <img src={branding.bannerImageUrl} alt="Banner" className="h-24 w-full object-cover" />
            )}
            <div className="p-4" style={{ backgroundColor: form.primaryColor + '10' }}>
              <div className="flex items-center gap-3">
                {branding?.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    {(form.displayName || 'C')[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold" style={{ color: form.primaryColor }}>
                    {form.displayName || 'Your Institute Name'}
                  </p>
                  <p className="text-xs text-gray-500">{form.tagline || 'Your tagline here'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;