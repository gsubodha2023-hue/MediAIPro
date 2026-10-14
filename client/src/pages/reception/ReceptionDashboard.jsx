import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { registerPatient, getAllAppointments } from "../../services/receptionService.js";
import { logoutUser } from "../../services/authService.js";
import { logout } from "../../redux/slices/authSlice.js";
import NotificationBell from "../../components/NotificationBell.jsx";
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

function RegisterPatientForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const { data } = await registerPatient(formData);
      toast.success(
        `Patient registered! Temp password: ${data.tempPassword} (share securely)`,
        { duration: 8000 }
      );
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <h2 className="font-medium text-gray-900">Register walk-in patient</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
          <input {...register("name", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input type="email" {...register("email", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
          <input {...register("phone")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
          <select {...register("gender")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      {Object.keys(errors).length > 0 && (
        <p className="text-red-500 text-xs">Name and email are required.</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
      >
        {isSubmitting ? "Registering..." : "Register patient"}
      </button>
    </form>
  );
}

export default function ReceptionDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [appointments, setAppointments] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllAppointments({ date: dateFilter })
      .then(({ data }) => setAppointments(data.appointments))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [dateFilter]);

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
        <div className="flex items-center justify-between mb-6">
          <BrandLogo to="/reception/dashboard" />
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:text-red-600"
          >
            <Icon name="logout" className="h-4 w-4" /> Log out
          </button>
        </div>
        <PageHero image={teamImage} eyebrow="Front-desk operations" title="Reception dashboard" description={`Welcome, ${user?.name || "team member"}. Register patients and coordinate today's clinic schedule.`} />

        <Link to="/reception/operations" className="mb-6 flex items-center justify-between rounded-2xl bg-[#082b3a] p-5 text-white shadow-clinical"><span><strong className="block">Open queue & billing</strong><span className="mt-1 block text-sm text-slate-300">Patient check-in, live queue and payment receipts</span></span><Icon name="chart"/></Link>

        <div className="flex justify-end mb-4">
          <NotificationBell />
        </div>

        <div className="mb-6">
          <RegisterPatientForm />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Appointments</h2>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5"
            />
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500 text-sm">No appointments for this date.</p>
          ) : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div key={a._id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.patient?.name} → Dr. {a.doctor?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{a.timeSlot} · {a.type}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
