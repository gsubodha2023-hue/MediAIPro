import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyAppointments, cancelAppointment } from "../../services/appointmentService.js";
import PatientNav from "../../components/PatientNav.jsx";
import { avatarUrl } from "../../utils/avatar.js";
import PageHero from "../../components/PageHero.jsx";
import appointmentImage from "../../assets/appointments-care.webp";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyAppointments()
      .then(({ data }) => setAppointments(data.appointments))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      toast.success("Appointment cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fa]">
      <PatientNav />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <PageHero image={appointmentImage} eyebrow="Your schedule" title="My appointments" description="Review upcoming visits, consultation details and appointment status in one place." />

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-clinical"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl(a.doctor?.user?.name)}
                    alt={a.doctor?.user?.name}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      Dr. {a.doctor?.user?.name} — {a.doctor?.specialization}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(a.date).toLocaleDateString()} at {a.timeSlot} · {a.type}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">{a.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[a.status]}`}
                  >
                    {a.status}
                  </span>
                  {["pending", "confirmed"].includes(a.status) && (
                    <button
                      onClick={() => handleCancel(a._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
