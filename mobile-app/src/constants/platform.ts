// Single source of truth for the PLATFORM's own identity — as opposed to
// an individual institute's branding (which lives in BrandingContext and
// only applies once a user is logged in and scoped to their institute).
//
// The login screen, splash/boot screens, and any other "pre-institute"
// surface should reference THIS, never a specific institute's branding —
// this is a multi-tenant SaaS, and no single coaching institute's name
// should appear before we even know which institute the user belongs to.

export const PLATFORM = {
  name: 'ClassTrack',
  tagline: 'One platform for your entire coaching institute',
} as const;