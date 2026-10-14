import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../services/authService.js";
import { setCredentials } from "../../redux/slices/authSlice.js";
import AuthLayout from "../../components/AuthLayout.jsx";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      const { data } = await registerUser(formData);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success("Account created successfully!");
      navigate("/patient/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout quote="“Your medical history, always one login away.”">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-clinical border border-slate-200">
        <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-primary-700">← Back to home</Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#082b3a] mb-2">Create your account</h1>
        <p className="text-gray-500 mb-7 text-sm">
          Set up your secure patient workspace. Staff accounts are managed by an administrator.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === watch("password") || "Passwords do not match",
              })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-primary-600/20 transition disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
