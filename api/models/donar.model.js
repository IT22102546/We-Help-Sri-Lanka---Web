import mongoose from "mongoose";

const donorOrganizationSchema = new mongoose.Schema(
  {
    timestamp: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: [
      {
        type: String,
      },
    ],
    contactPersons: [
      {
        type: String,
      },
    ],
    email: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    transportationNeed: {
      type: String,
      enum: ["Need", "No", "Not mentioned", ""],
      default: "Not mentioned",
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
    availabilityNotes: {
      type: String,
      default: "",
    },
    callStatus: {
      type: String,
      enum: ["Called - answered", "Called - not answered", ""],
      default: "",
    },
    status: {
      type: String,
      enum: [
        "Linked with someone",
        "Did not Link",
        "",
      ],
      default: "",
    },
    collectionDates: {
      type: String,
      default: "",
    },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      branch: { type: String, default: "" },
      swiftCode: { type: String, default: "" },
      reference: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
donorOrganizationSchema.index({ district: 1 });
donorOrganizationSchema.index({ supportTypes: 1 });
donorOrganizationSchema.index({ callStatus: 1 });
donorOrganizationSchema.index({ status: 1 });
donorOrganizationSchema.index({ createdAt: -1 });

// Text index for searching organization names and locations
donorOrganizationSchema.index({ 
  name: "text", 
  location: "text", 
  availabilityNotes: "text" 
});

const DonorOrganization = mongoose.model(
  "DonorOrganization",
  donorOrganizationSchema,
  "donorOrganizations"
);

export default DonorOrganization;