const ApiError = require('../../utils/ApiError');
const calendarRepository = require('./calendar.repository');
const batchRepository = require('../batch/batch.repository');
const notificationService = require('../notification/notification.service');
const { ROLES } = require('../../config/constants');

const createEvent = async (requester, { title, date, type, batchId, description }) => {
  if (batchId) {
    const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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
    const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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

// Returns events relevant to the requesting user — institute-wide + their own batch(es)
const getMyEvents = async (requester, userBatchIds = []) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  return calendarRepository.findForUser(filter, userBatchIds);
};

const getAllEvents = async (requester) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  return calendarRepository.findAllForInstitute(filter);
};

const deleteEvent = async (requester, eventId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const event = await calendarRepository.findByIdScoped(eventId, filter);
  if (!event) throw new ApiError(404, 'Event not found');
  await calendarRepository.deleteById(eventId);
};

module.exports = { createEvent, getMyEvents, getAllEvents, deleteEvent };