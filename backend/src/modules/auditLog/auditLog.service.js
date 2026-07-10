const auditLogRepository = require('./auditLog.repository');
const logger = require('../../utils/logger');

// Fire-and-forget style logging — audit failures should not block the main request,
// but we do log to Winston if the DB write fails, so nothing is silently lost.
const logAccess = async ({ userId, role, action, targetInstituteId, details }) => {
  try {
    await auditLogRepository.create({ userId, role, action, targetInstituteId, details });
  } catch (err) {
    logger.error(`AuditLog write failed: ${err.message}`);
  }
};

const getAuditTrail = (filter = {}) => auditLogRepository.findAll(filter);

module.exports = { logAccess, getAuditTrail };