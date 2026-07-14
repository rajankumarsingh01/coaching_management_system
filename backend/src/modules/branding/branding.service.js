const ApiError = require('../../utils/ApiError');
const brandingRepository = require('./branding.repository');
const cloudinary = require('../../config/cloudinary.config');
const { uploadBufferToCloudinary } = require('../../utils/cloudinaryUpload');
const { ROLES } = require('../../config/constants');

// Any authenticated user of the institute can read branding (used to theme their own app)
const getBranding = async (requester, instituteId) => {
  if (requester.role !== ROLES.SUPER_ADMIN && String(requester.instituteId) !== String(instituteId)) {
    throw new ApiError(403, 'Cannot view branding for a different institute');
  }

  const institute = await brandingRepository.findById(instituteId);
  if (!institute) throw new ApiError(404, 'Institute not found');

  return { instituteName: institute.name, ...institute.branding.toObject() };
};

// Note: no subscription-tier gating here (per Update 11 — every institute gets full branding, trial or paid)
const updateBranding = async (requester, instituteId, updates) => {
  if (requester.role !== ROLES.SUPER_ADMIN && String(requester.instituteId) !== String(instituteId)) {
    throw new ApiError(403, 'Cannot update branding for a different institute');
  }

  const institute = await brandingRepository.updateBranding(instituteId, updates);
  if (!institute) throw new ApiError(404, 'Institute not found');

  return institute.branding;
};

const uploadLogo = async (requester, instituteId, file) => {
  if (requester.role !== ROLES.SUPER_ADMIN && String(requester.instituteId) !== String(instituteId)) {
    throw new ApiError(403, 'Cannot update branding for a different institute');
  }
  if (!file) throw new ApiError(400, 'A file is required');

  const institute = await brandingRepository.findById(instituteId);
  if (!institute) throw new ApiError(404, 'Institute not found');

  // clean up the old logo from Cloudinary if one already existed
  if (institute.branding.logoPublicId) {
    await cloudinary.uploader.destroy(institute.branding.logoPublicId).catch(() => {});
  }

  const result = await uploadBufferToCloudinary(file.buffer, 'coaching-app/branding/logos');

  const updated = await brandingRepository.updateBranding(instituteId, {
    logoUrl: result.secure_url,
    logoPublicId: result.public_id,
  });

  return updated.branding;
};

const uploadBanner = async (requester, instituteId, file) => {
  if (requester.role !== ROLES.SUPER_ADMIN && String(requester.instituteId) !== String(instituteId)) {
    throw new ApiError(403, 'Cannot update branding for a different institute');
  }
  if (!file) throw new ApiError(400, 'A file is required');

  const institute = await brandingRepository.findById(instituteId);
  if (!institute) throw new ApiError(404, 'Institute not found');

  if (institute.branding.bannerPublicId) {
    await cloudinary.uploader.destroy(institute.branding.bannerPublicId).catch(() => {});
  }

  const result = await uploadBufferToCloudinary(file.buffer, 'coaching-app/branding/banners');

  const updated = await brandingRepository.updateBranding(instituteId, {
    bannerImageUrl: result.secure_url,
    bannerPublicId: result.public_id,
  });

  return updated.branding;
};

module.exports = { getBranding, updateBranding, uploadLogo, uploadBanner };