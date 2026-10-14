import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../../services/authService.js";
import { setCredentials } from "../../redux/slices/authSlice.js";
import AuthLayout from "../../components/AuthLayout.jsx";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      const { data } = await loginUser(formData);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success(`Welcome back, ${data.user.name}!`);

      // Route to the right dashboard based on role
      const roleHome = {
        patient: "/patient/dashboard",
        doctor: "/doctor/dashboard",
        receptionist: "/reception/dashboard",
        admin: "/admin/dashboard",
        superadmin: "/admin/dashboard",
      };
      navigate(roleHome[data.user.role] || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout quote="“Booking an appointment took less time than making coffee.”">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-clinical border border-slate-200">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary-700">← Back to home</Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#082b3a] mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-7 text-sm">Sign in to continue to your secure workspace.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
            <div className="mt-2 text-right"><Link to="/forgot-password" className="text-xs font-bold text-primary-700">Forgot password?</Link></div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-primary-600/20 transition disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
