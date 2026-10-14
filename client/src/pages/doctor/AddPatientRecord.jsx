import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { uploadRecord } from "../../services/medicalRecordService.js";
import BrandLogo from "../../components/BrandLogo.jsx";
import PageHero from "../../components/PageHero.jsx";
import recordsImage from "../../assets/medical-records-care.webp";

// Reached from the doctor dashboard via a link like:
// /doctor/records/new?patientId=...&appointmentId=...&patientName=...
export default function AddPatientRecord() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const patientId = params.get("patientId");
  const appointmentId = params.get("appointmentId");
  const patientName = params.get("patientName");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await uploadRecord({
        type: formData.type,
        title: formData.title,
        description: formData.description,
        patientId,
        appointmentId,
      });
      toast.success("Record added to patient's history");
      navigate("/doctor/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add record");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fa] p-5 sm:p-8">
      <div className="mx-auto max-w-5xl"><div className="mb-7"><BrandLogo to="/doctor/dashboard" /></div>
      <PageHero image={recordsImage} eyebrow="Clinical documentation" title="Add medical record" description={`Create a secure diagnosis, prescription or clinical note for ${patientName || "this patient"}.`} />
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-clinical">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Add medical record</h1>
        <p className="text-gray-500 text-sm mb-6">
          For patient: <span className="font-medium">{patientName}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Record type</label>
            <select
              {...register("type", { required: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="diagnosis">Diagnosis</option>
              <option value="prescription">Prescription</option>
              <option value="note">Clinical note</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. Acute bronchitis"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
            <textarea
              {...register("description", { required: "Please add details" })}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Diagnosis details, prescribed medication + dosage, follow-up instructions..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save record"}
          </button>
        </form>
      </div></div>
    </div>
  );
}
