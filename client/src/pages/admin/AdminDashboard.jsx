import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { getAllUsers, createStaffUser, toggleUserStatus } from "../../services/adminService.js";
import { logoutUser } from "../../services/authService.js";
import { logout } from "../../redux/slices/authSlice.js";
import NotificationBell from "../../components/NotificationBell.jsx";
import BrandLogo from "../../components/BrandLogo.jsx";
import PageHero from "../../components/PageHero.jsx";
import Icon from "../../components/Icon.jsx";
import teamImage from "../../assets/clinical-team.webp";

const roleColors = {
  patient: "bg-gray-100 text-gray-600",
  doctor: "bg-blue-100 text-blue-700",
  receptionist: "bg-purple-100 text-purple-700",
  admin: "bg-amber-100 text-amber-700",
  superadmin: "bg-red-100 text-red-700",
};

function CreateStaffForm({ onCreated }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: "doctor" } });
  const role = watch("role");

  const onSubmit = async (formData) => {
    try {
      await createStaffUser(formData);
      toast.success(`${formData.role} account created`);
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <h2 className="font-medium text-gray-900">Create staff account</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
          <select {...register("role")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
          <input {...register("name", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input type="email" {...register("email", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
          <input type="password" {...register("password", { required: true, minLength: 8 })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        {role === "doctor" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
              <input {...register("specialization", { required: role === "doctor" })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">License number</label>
              <input {...register("licenseNumber", { required: role === "doctor" })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </>
        )}
      </div>
      {Object.keys(errors).length > 0 && (
        <p className="text-red-500 text-xs">Please fill in all required fields.</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllUsers(roleFilter)
      .then(({ data }) => setUsers(data.users))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [roleFilter]);

  const handleToggle = async (id) => {
    try {
      await toggleUserStatus(id);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
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
        <div className="flex items-center justify-between mb-6">
          <BrandLogo to="/admin/dashboard" />
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:text-red-600"
          >
            <Icon name="logout" className="h-4 w-4" /> Log out
          </button>
        </div>
        <PageHero image={teamImage} eyebrow="Platform administration" title="Admin dashboard" description={`Welcome, ${user?.name || "administrator"}. Manage staff access, roles and platform users securely.`} />

        <Link to="/admin/operations" className="mb-6 flex items-center justify-between rounded-2xl bg-[#082b3a] p-5 text-white shadow-clinical"><span><strong className="block">Open operations command center</strong><span className="mt-1 block text-sm text-slate-300">Analytics, hospitals, payments, audit logs and content</span></span><Icon name="chart"/></Link>

        <div className="flex justify-end mb-4">
          <NotificationBell />
        </div>

        <div className="mb-6">
          <CreateStaffForm onCreated={load} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">All users</h2>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5"
            >
              <option value="">All roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="receptionist">Receptionists</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                    <span className={`text-xs ${u.isActive ? "text-green-600" : "text-gray-400"}`}>
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                    {u.role !== "superadmin" && (
                      <button
                        onClick={() => handleToggle(u._id)}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
