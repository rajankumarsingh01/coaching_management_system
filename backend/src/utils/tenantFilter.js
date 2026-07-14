const { ROLES } = require('../config/constants');

/**
 * Returns the MongoDB filter to scope a query to the requester's own
 * institute — empty filter (no restriction) for super_admin, scoped
 * otherwise.
 *
 * This was previously copy-pasted as an inline ternary in 10+ service
 * files (attendance, fee, notes, lecture, test, result, homework, batch,
 * calendar, submission). Centralizing it here means a future module can't
 * accidentally forget it or get it wrong, and any future change (e.g.
 * adding a second exempt role) only needs to happen in one place.
 */
const getTenantFilter = (requester) =>
  requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };

module.exports = { getTenantFilter };