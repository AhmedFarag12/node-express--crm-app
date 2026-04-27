const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    company: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    tags: [{ type: String, trim: true }],
    notes: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'prospect'],
      default: 'active',
      index: true,
    },
    totalSpent: { type: Number, default: 0, min: 0 },
    lastPurchaseAt: { type: Date },
    convertedFromLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
