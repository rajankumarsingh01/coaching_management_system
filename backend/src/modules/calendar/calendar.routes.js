const express = require('express');
const router = express.Router();

const calendarController = require('./calendar.controller');
const { createEventSchema } = require('./calendar.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER),
  validate(createEventSchema),
  calendarController.createEvent
);

router.get('/me', calendarController.getMyEvents); // any authenticated role

router.get('/all', roleMiddleware(ROLES.ADMIN), calendarController.getAllEvents);

router.delete('/:id', roleMiddleware(ROLES.ADMIN, ROLES.TEACHER), calendarController.deleteEvent);

module.exports = router;