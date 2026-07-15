const mongoose = require('mongoose');

// Status teen states me hota hai:
// pending  -> abhi tak kuch bhi paid/advance nahi hua
// partial  -> kuch amount (advance ya partial payment) diya ja chuka hai, poora nahi
// paid     -> baseSalary poora settle ho chuka hai (advance + paid amount >= baseSalary)
const SALARY_STATUS = Object.freeze({
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
});

const salarySchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },

    // month 1-12, year e.g. 2026 — ye combination batata hai ye salary kis mahine ki hai
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },

    baseSalary: { type: Number, required: true, min: 0 }, // is mahine ka tay kiya hua salary
    advanceTaken: { type: Number, default: 0, min: 0 }, // is mahine teacher ne kitna advance liya
    amountPaid: { type: Number, default: 0, min: 0 }, // month-end settlement me kitna diya (advance ke alawa)

    status: { type: String, enum: Object.values(SALARY_STATUS), default: SALARY_STATUS.PENDING },
    paidDate: { type: Date, default: null }, // jab poora salary settle ho jaye tab set hoga

    remarks: { type: String, default: '' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // record kisne banaya/update kiya
  },
  { timestamps: true }
);

// Ek teacher ka ek mahine me sirf ek hi salary record ho sakta hai — duplicate
// entry (accidental double-create) DB level par hi rok di jati hai.
salarySchema.index({ teacherId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
module.exports.SALARY_STATUS = SALARY_STATUS;
