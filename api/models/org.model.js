import mongoose from "mongoose";

const orgSchema = new mongoose.Schema(
  {
    timestamp: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    phone: [
      {
        type: String,
      },
    ],
    district: {
      type: String,
    },
    address: {
      type: String,
    },
    location: {
      type: String,
    },
    transportationNeed: {
      type: String,
      default: "",
    },
    supportTypes: [
      {
        type: String,
      },
    ],
    otherSupport: [
      {
        type: String,
      },
    ],
    time: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "Not yet received",
        "Linked with someone",
        "Did not Link",
        "Received",
        "Already received",
        "Complete",
        "FAKE",
        "",
      ],
      default: "Not yet received",
    },
    callStatus: {
      type: String,
      enum: ["Called - answered", "Called - not answered", ""],
      default: "",
    },
    availabilityNotes: {
      type: String,
      default: "Not mentioned",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
orgSchema.index({ district: 1 });
orgSchema.index({ status: 1 });
orgSchema.index({ priority: 1 });
orgSchema.index({ verified: 1 });
orgSchema.index({ createdAt: -1 });

const donorOrganization = mongoose.model(
  "donorOrganization",
  orgSchema,
  "donorOrganizations"
);

export default donorOrganization;
