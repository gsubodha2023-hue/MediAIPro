import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../../services/doctorService.js";
import { bookAppointment } from "../../services/appointmentService.js";
import PatientNav from "../../components/PatientNav.jsx";
import { avatarUrl } from "../../utils/avatar.js";
import PageHero from "../../components/PageHero.jsx";
import Icon from "../../components/Icon.jsx";
import appointmentImage from "../../assets/appointments-care.webp";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const selectedDoctorId = watch("doctorId");

  useEffect(() => {
    getDoctors()
      .then(({ data }) => setDoctors(data.doctors))
      .catch(() => toast.error("Failed to load doctors"))
      .finally(() => setLoadingDoctors(false));
  }, []);

  const onSubmit = async (formData) => {
    try {
      await bookAppointment({
        doctorId: formData.doctorId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        type: formData.type,
        reason: formData.reason,
      });
      toast.success("Appointment booked! Awaiting doctor confirmation.");
      navigate("/patient/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fa]">
      <PatientNav />
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <PageHero image={appointmentImage} eyebrow="Appointments" title="Book care with confidence" description="Choose a verified doctor, visit type and time that works for you." />
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-clinical sm:p-8">
        <h2 className="mb-6 flex items-center gap-3 text-xl font-extrabold text-[#082b3a]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700"><Icon name="calendar" /></span>Appointment details</h2>

        {loadingDoctors ? (
          <p className="text-gray-500 text-sm">Loading doctors...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
              <div className="grid grid-cols-2 gap-3">
                {doctors.map((d) => (
                  <label
                    key={d._id}
                    className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition ${
                      selectedDoctorId === d._id
                        ? "border-primary-600 ring-1 ring-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={d._id}
                      {...register("doctorId", { required: "Please select a doctor" })}
                      className="sr-only"
                    />
                    <img
                      src={avatarUrl(d.user?.name)}
                      alt={d.user?.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Dr. {d.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{d.specialization}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.doctorId && (
                <p className="text-red-500 text-xs mt-1">{errors.doctorId.message}</p>
              )}
              {doctors.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">
                  No verified doctors yet — an admin needs to create doctor accounts first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  {...register("date", { required: "Date is required" })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time slot</label>
                <select
                  {...register("timeSlot", { required: "Time is required" })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.timeSlot && (
                  <p className="text-red-500 text-xs mt-1">{errors.timeSlot.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visit type</label>
              <select
                {...register("type")}
                defaultValue="in-person"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="in-person">In-person</option>
                <option value="video">Video consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for visit
              </label>
              <textarea
                {...register("reason", { required: "Please describe your reason for visit" })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. Persistent headache for 3 days"
              />
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
            >
              {isSubmitting ? "Booking..." : "Book appointment"}
            </button>
          </form>
        )}
      </div></main>
    </div>
  );
}
