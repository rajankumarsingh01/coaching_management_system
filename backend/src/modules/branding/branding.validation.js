const { z } = require('zod');

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

const updateBrandingSchema = z.object({
  body: z.object({
    displayName: z.string().max(100).optional(),
    tagline: z.string().max(200).optional(),
    primaryColor: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color').optional(),
    secondaryColor: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color').optional(),
    contactPhone: z.string().max(20).optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    contactAddress: z.string().max(300).optional(),
    aboutText: z.string().max(2000).optional(),
    socialLinks: z
      .object({
        website: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        youtube: z.string().optional(),
      })
      .optional(),
  }),
});

module.exports = { updateBrandingSchema };