const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const instituteService = require('./institute.service');

const createInstitute = catchAsync(async (req, res) => {
  const result = await instituteService.createInstituteWithAdmin(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, result, 'Institute and admin created successfully'));
});

const getAllInstitutes = catchAsync(async (req, res) => {
  const institutes = await instituteService.getAllInstitutes(req.user.id);
  res.status(200).json(new ApiResponse(200, institutes, 'Institutes fetched successfully'));
});

module.exports = { createInstitute, getAllInstitutes };