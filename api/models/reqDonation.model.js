import mongoose from 'mongoose';

const donationRequestSchema = new mongoose.Schema({
  timestamp: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  phone: [{
    type: String
  }],
  district: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  numberOfPeople: {
    type: String,
    default: ''
  },
  requirements: [{
    type: String
  }],
  otherRequirements: [{
    type: String
  }],
  time: {
    type: String,
    default: null
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Not yet received', 'Linked a supplier', 'Received', 'Already received', 'FAKE', ''],
    default: 'Not yet received'
  },
  callStatus: {
    type: String,
    enum: ['Called - answered', 'Called - not answered', ''],
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
donationRequestSchema.index({ district: 1 });
donationRequestSchema.index({ status: 1 });
donationRequestSchema.index({ priority: 1 });
donationRequestSchema.index({ verified: 1 });
donationRequestSchema.index({ createdAt: -1 });

const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);

export default DonationRequest;