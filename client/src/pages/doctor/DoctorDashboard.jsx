import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService.js";
import { logoutUser } from "../../services/authService.js";
import { logout } from "../../redux/slices/authSlice.js";
import NotificationBell from "../../components/NotificationBell.jsx";
import { avatarUrl } from "../../utils/avatar.js";
import BrandLogo from "../../components/BrandLogo.jsx";
import PageHero from "../../components/PageHero.jsx";
import Icon from "../../components/Icon.jsx";
import teamImage from "../../assets/clinical-team.webp";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function DoctorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getDoctorAppointments()
      .then(({ data }) => setAppointments(data.appointments))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to load appointments")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      dispatch(logout());
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fa] p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <BrandLogo to="/doctor/dashboard" />
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:text-red-600"
          >
            <Icon name="logout" className="h-4 w-4" /> Log out
          </button>
        </div>
        <PageHero image={teamImage} eyebrow="Clinical workspace" title={`Welcome, Dr. ${user?.name || "Doctor"}`} description="Review today's appointments, coordinate patient care and keep medical records up to date." />

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Link to="/doctor/clinical" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm"><Icon name="pill" className="text-primary-700"/>Prescriptions</Link>
          <Link to="/doctor/clinical" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm"><Icon name="calendar" className="text-primary-700"/>Schedule</Link>
          <Link to="/doctor/clinical" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm"><Icon name="users" className="text-primary-700"/>Video care</Link>
        </div>

        <div className="flex justify-end -mt-6 mb-4">
          <NotificationBell />
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-clinical"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl(a.patient?.name)}
                      alt={a.patient?.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{a.patient?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(a.date).toLocaleDateString()} at {a.timeSlot} · {a.type}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{a.reason}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[a.status]}`}
                  >
                    {a.status}
                  </span>
                </div>

                {a.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleStatusChange(a._id, "confirmed")}
                      className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(a._id, "cancelled")}
                      className="text-xs border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {a.status === "confirmed" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleStatusChange(a._id, "completed")}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg"
                    >
                      Mark completed
                    </button>
                  </div>
                )}
                {(a.status === "completed" || a.status === "confirmed") && (
                  <div className="mt-2">
                    <Link
                      to={`/doctor/records/new?patientId=${a.patient?._id}&appointmentId=${a._id}&patientName=${encodeURIComponent(a.patient?.name || "")}`}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      + Add diagnosis / prescription note
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
