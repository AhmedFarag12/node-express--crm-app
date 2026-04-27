const mongoose = require('mongoose');

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    source: {
      type: String,
      enum: ['website', 'referral', 'ads', 'social', 'event', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'new',
      index: true,
    },
    estimatedValue: { type: Number, default: 0, min: 0 },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    expectedCloseDate: { type: Date },
    notes: { type: String },
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

leadSchema.virtual('weightedValue').get(function () {
  return (this.estimatedValue || 0) * ((this.probability || 0) / 100);
});

leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Lead', leadSchema);
module.exports.LEAD_STATUSES = LEAD_STATUSES;
