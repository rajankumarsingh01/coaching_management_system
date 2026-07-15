const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const leadService = require('./lead.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createLead = catchAsync(async (req, res) => {
  const lead = await leadService.createLead(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, lead, 'Lead created successfully'));
});

const getAllLeads = catchAsync(async (req, res) => {
  const leads = await leadService.getAllLeads(getRequester(req), { status: req.query.status });
  res.status(200).json(new ApiResponse(200, leads, 'Leads fetched successfully'));
});

const getLeadById = catchAsync(async (req, res) => {
  const lead = await leadService.getLeadById(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, lead, 'Lead fetched successfully'));
});

const updateLead = catchAsync(async (req, res) => {
  const lead = await leadService.updateLead(getRequester(req), req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, lead, 'Lead updated successfully'));
});

const changeStatus = catchAsync(async (req, res) => {
  const lead = await leadService.changeStatus(getRequester(req), req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, lead, 'Lead status updated successfully'));
});

const addNote = catchAsync(async (req, res) => {
  const lead = await leadService.addNoteToLead(getRequester(req), req.params.id, req.body.text);
  res.status(200).json(new ApiResponse(200, lead, 'Note added successfully'));
});

const deleteLead = catchAsync(async (req, res) => {
  await leadService.deleteLead(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Lead deactivated successfully'));
});

const getFollowUpsDueToday = catchAsync(async (req, res) => {
  const leads = await leadService.getFollowUpsDueToday(getRequester(req));
  res.status(200).json(new ApiResponse(200, leads, 'Due follow-ups fetched successfully'));
});

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  changeStatus,
  addNote,
  deleteLead,
  getFollowUpsDueToday,
};