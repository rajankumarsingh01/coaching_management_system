const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
});

const SUBSCRIPTION_STATUS = Object.freeze({
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
});

// NEW — Lead/Admission CRM ke liye lead ka lifecycle status
const LEAD_STATUS = Object.freeze({
  NEW: 'new',
  CONTACTED: 'contacted',
  TRIAL_GIVEN: 'trial_given',
  ENROLLED: 'enrolled',
  LOST: 'lost',
});

module.exports = { ROLES, SUBSCRIPTION_STATUS, LEAD_STATUS };