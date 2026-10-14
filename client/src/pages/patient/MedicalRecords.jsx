import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { getMyRecords, uploadRecord } from "../../services/medicalRecordService.js";
import { fileUrl } from "../../utils/fileUrl.js";
import PatientNav from "../../components/PatientNav.jsx";
import PageHero from "../../components/PageHero.jsx";
import Icon from "../../components/Icon.jsx";
import recordsImage from "../../assets/medical-records-care.webp";

const typeLabels = {
  diagnosis: "Diagnosis",
  prescription: "Prescription",
  lab_report: "Lab report",
  note: "Note",
};

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const load = () => {
    setLoading(true);
    getMyRecords()
      .then(({ data }) => setRecords(data.records))
      .catch(() => toast.error("Failed to load records"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (formData) => {
    try {
      await uploadRecord({
        type: "lab_report",
        title: formData.title,
        description: formData.description,
        file: formData.file[0],
      });
      toast.success("Record uploaded");
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fa]">
      <PatientNav />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <PageHero image={recordsImage} eyebrow="Protected health history" title="Medical records" description="Keep lab reports, prescriptions and clinical notes organized and easy to access." />
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-3 text-xl font-extrabold text-[#082b3a]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700"><Icon name="records" /></span>Your health timeline</h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            <span className="inline-flex items-center gap-2"><Icon name={showForm ? "logout" : "upload"} className="h-4 w-4" />{showForm ? "Cancel" : "Upload lab report"}</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                {...register("title", { required: "Title is required" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. Blood test - January 2026"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File (PDF, JPG, PNG — max 10MB)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                {...register("file", { required: "Please select a file" })}
                className="w-full text-sm"
              />
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500 text-sm">No records yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                      {typeLabels[r.type]}
                    </span>
                    <p className="font-medium text-gray-900">{r.title}</p>
                    {r.doctor?.user?.name && (
                      <p className="text-sm text-gray-500">Dr. {r.doctor.user.name}</p>
                    )}
                    {r.description && (
                      <p className="text-sm text-gray-400 mt-1">{r.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.attachment?.fileUrl && (
                  <a
                    href={fileUrl(r.attachment.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-xs text-primary-600 hover:underline"
                  >
                    View attachment ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
