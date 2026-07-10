const AuditLog = require('./auditLog.model');

const create = (data) => AuditLog.create(data);

const findAll = (filter = {}) => AuditLog.find(filter).sort({ createdAt: -1 });

module.exports = { create, findAll };