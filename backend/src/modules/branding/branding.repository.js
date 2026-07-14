const Institute = require('../institute/institute.model');

const findById = (instituteId) => Institute.findById(instituteId);

const updateBranding = (instituteId, brandingUpdates) =>
  Institute.findByIdAndUpdate(
    instituteId,
    { $set: Object.fromEntries(Object.entries(brandingUpdates).map(([k, v]) => [`branding.${k}`, v])) },
    { new: true }
  );

module.exports = { findById, updateBranding };