const ApiError = require('../../utils/ApiError');
const leadRepository = require('./lead.repository');
const { getTenantFilter } = require('../../utils/tenantFilter');

const createLead = async (requester, data) => {
  if (!requester.instituteId) {
    throw new ApiError(400, 'Requesting user has no institute context');
  }

  const lead = await leadRepository.create({
    ...data,
    instituteId: requester.instituteId,
  });

  return lead;
};

const getAllLeads = async (requester, { status } = {}) => {
  const filter = getTenantFilter(requester);
  filter.isActive = true;
  if (status) {
    filter.status = status;
  }
  return leadRepository.findAll(filter);
};

const getLeadById = async (requester, leadId) => {
  const filter = getTenantFilter(requester);
  const lead = await leadRepository.findByIdScoped(leadId, filter);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }
  return lead;
};

const updateLead = async (requester, leadId, updates) => {
  // ensures the lead belongs to the requester's institute before allowing update
  await getLeadById(requester, leadId);
  const updated = await leadRepository.updateById(leadId, updates);
  return updated;
};

const changeStatus = async (requester, leadId, status) => {
  await getLeadById(requester, leadId);
  const updated = await leadRepository.updateById(leadId, { status });
  return updated;
};

const addNoteToLead = async (requester, leadId, text) => {
  await getLeadById(requester, leadId);
  const updated = await leadRepository.addNote(leadId, {
    text,
    addedBy: requester.id,
    addedAt: new Date(),
  });
  return updated;
};

const deleteLead = async (requester, leadId) => {
  await getLeadById(requester, leadId);
  const deleted = await leadRepository.deleteById(leadId);
  return deleted;
};

const getFollowUpsDueToday = async (requester) => {
  const filter = getTenantFilter(requester);
  filter.isActive = true;
  return leadRepository.findFollowUpsDue(filter);
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  changeStatus,
  addNoteToLead,
  deleteLead,
  getFollowUpsDueToday,
};