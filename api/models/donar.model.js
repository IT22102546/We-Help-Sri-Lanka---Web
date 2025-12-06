import mongoose from "mongoose";

const donarSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "DonationRequest",
    },

    donorName: {
      type: String,
      required: true,
    },
    donorEmail: {
      type: String,
      required: true,
    },
    donorPhone: {
      type: String,
      required: true,
    },
    donationType: [
      {
        type: String,
      },
    ],
    /*quantity: {
      type: String,
      required: true,
    },*/
    district: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
   /* estimatedValue: {
      type: String,
      required: true,
    },*/
    deliveryMethod: {
      type: String,
      required: true,
    },

    reply: {
      type: String,
    },
  },
  { timestamps: true }
);

const Donor = mongoose.model("Donor", donarSchema);
export default Donor;
