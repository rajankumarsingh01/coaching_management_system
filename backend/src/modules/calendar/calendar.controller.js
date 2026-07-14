const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const calendarService = require('./calendar.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createEvent = catchAsync(async (req, res) => {
  const event = await calendarService.createEvent(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, event, 'Event created successfully'));
});

const getMyEvents = catchAsync(async (req, res) => {
  // req.user.batchIds comes from the JWT payload — see auth.service.js update below
  const events = await calendarService.getMyEvents(getRequester(req), req.user.batchIds || []);
  res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'));
});

const getAllEvents = catchAsync(async (req, res) => {
  const events = await calendarService.getAllEvents(getRequester(req));
  res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'));
});

const deleteEvent = catchAsync(async (req, res) => {
  await calendarService.deleteEvent(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Event deleted successfully'));
});

module.exports = { createEvent, getMyEvents, getAllEvents, deleteEvent };