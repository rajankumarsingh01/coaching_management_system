const ApiError = require('../../utils/ApiError');
const calendarRepository = require('./calendar.repository');
const batchRepository = require('../batch/batch.repository');
const notificationService = require('../notification/notification.service');
const { ROLES } = require('../../config/constants');
const userRepository = require('../user/user.repository');
const { getTenantFilter } = require('../../utils/tenantFilter');

const createEvent = async (requester, { title, date, type, batchId, description }) => {
  if (batchId) {
    const filter = getTenantFilter(requester);
    const batch = await batchRepository.findByIdScoped(batchId, filter);
    if (!batch) throw new ApiError(404, 'Batch not found');
  }

  const event = await calendarRepository.create({
    title,
    date: new Date(date),
    type: type || 'event',
    batchId: batchId || null,
    instituteId: requester.instituteId,
    createdBy: requester.id,
    description: description || '',
  });

  // Notify relevant students if this is batch-scoped — fire-and-forget, never blocks the response
  if (batchId) {
   const filter = getTenantFilter(requester);
    const batch = await batchRepository.findByIdScoped(batchId, filter);
    if (batch && batch.studentIds.length > 0) {
      notificationService
        .sendToUsers(batch.studentIds, {
          title: 'New Calendar Event',
          body: `${title} on ${new Date(date).toLocaleDateString()}`,
          data: { type: 'calendar', eventId: String(event._id) },
        })
        .catch(() => {});
    }
  }

  return event;
};


// Fetches the user's CURRENT batchIds from the DB instead of trusting the
// JWT's cached copy — the JWT can be stale for up to the access-token's
// lifetime if an admin adds/removes the user from a batch after login,
// which could show stale events or hide new ones until next token refresh.
const getMyEvents = async (requester) => {
  const filter = getTenantFilter(requester);

  let currentBatchIds = [];
  if (requester.role === ROLES.STUDENT || requester.role === ROLES.TEACHER) {
    const user = await userRepository.findById(requester.id);
    currentBatchIds = user?.batchIds || [];
  }

  return calendarRepository.findForUser(filter, currentBatchIds);
};

const getAllEvents = async (requester) => {
 const filter = getTenantFilter(requester);
  return calendarRepository.findAllForInstitute(filter);
};

const deleteEvent = async (requester, eventId) => {
 const filter = getTenantFilter(requester);
  const event = await calendarRepository.findByIdScoped(eventId, filter);
  if (!event) throw new ApiError(404, 'Event not found');
  await calendarRepository.deleteById(eventId);
};

module.exports = { createEvent, getMyEvents, getAllEvents, deleteEvent };