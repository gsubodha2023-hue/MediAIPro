import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: not every record has to come from a doctor visit
    // (e.g. patient self-uploading an old lab report)
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    type: {
      type: String,
      enum: ["diagnosis", "prescription", "lab_report", "note"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Uploaded file metadata (for lab_report / scanned prescription uploads)
    attachment: {
      fileName: String,
      fileUrl: String, // path/URL to the stored file
      fileType: String, // mime type
      fileSize: Number, // bytes
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
