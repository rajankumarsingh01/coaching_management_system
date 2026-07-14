const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const brandingService = require('./branding.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const getBranding = catchAsync(async (req, res) => {
  const branding = await brandingService.getBranding(getRequester(req), req.params.instituteId);
  res.status(200).json(new ApiResponse(200, branding, 'Branding fetched successfully'));
});

const updateBranding = catchAsync(async (req, res) => {
  const branding = await brandingService.updateBranding(getRequester(req), req.params.instituteId, req.body);
  res.status(200).json(new ApiResponse(200, branding, 'Branding updated successfully'));
});

const uploadLogo = catchAsync(async (req, res) => {
  const branding = await brandingService.uploadLogo(getRequester(req), req.params.instituteId, req.file);
  res.status(200).json(new ApiResponse(200, branding, 'Logo uploaded successfully'));
});

const uploadBanner = catchAsync(async (req, res) => {
  const branding = await brandingService.uploadBanner(getRequester(req), req.params.instituteId, req.file);
  res.status(200).json(new ApiResponse(200, branding, 'Banner uploaded successfully'));
});

module.exports = { getBranding, updateBranding, uploadLogo, uploadBanner };