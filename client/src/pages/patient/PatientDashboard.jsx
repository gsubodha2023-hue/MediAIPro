import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../../services/authService.js";
import { logout } from "../../redux/slices/authSlice.js";
import toast from "react-hot-toast";
import PatientNav from "../../components/PatientNav.jsx";
import Icon from "../../components/Icon.jsx";
import aiImage from "../../assets/ai-assistant-banner.webp";
import appointmentImage from "../../assets/appointments-care.webp";
import recordsImage from "../../assets/medical-records-care.webp";

const quickLinks = [
  { to: "/patient/ai-assistant", icon: "ai", image: aiImage, title: "AI Health Assistant", desc: "Ask questions or complete a quick symptom check", action: "Start a conversation" },
  { to: "/patient/book", icon: "calendar", image: appointmentImage, title: "Book an appointment", desc: "Find a verified doctor and choose a convenient time", action: "Find a doctor" },
  { to: "/patient/records", icon: "records", image: recordsImage, title: "Medical records", desc: "Review your care history, prescriptions and reports", action: "Open records" },
];

const careTools = [
  { to: "/patient/care", icon: "heart", title: "Health tracking", desc: "Blood pressure, sugar, BMI, weight, water and sleep" },
  { to: "/patient/care", icon: "pill", title: "Medication plan", desc: "Digital prescriptions and dose reminders" },
  { to: "/patient/profile", icon: "profile", title: "Profile & safety", desc: "Clinical details, emergency contacts and account security" },
];

export default function PatientDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      dispatch(logout());
      toast.success("Logged out");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fa] dark:bg-gray-950">
      <PatientNav />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-primary-700">PATIENT OVERVIEW</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#082b3a] dark:text-white">Welcome back, {user?.name || "there"}</h1>
            <p className="mt-2 text-sm text-slate-500">Your care, appointments and health information in one secure place.</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900"><Icon name="logout" className="h-4 w-4" />Log out</button>
        </div>

        <section className="mt-9 grid gap-4 md:grid-cols-[1.35fr_.65fr]">
          <div className="relative overflow-hidden rounded-3xl bg-[#082b3a] p-7 text-white shadow-clinical sm:p-9">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary-100">Health assistant</p>
            <h2 className="relative mt-4 max-w-lg text-2xl font-extrabold sm:text-3xl">Good care starts with a clear next step.</h2>
            <p className="relative mt-3 max-w-xl text-sm leading-6 text-slate-300">Ask a health question, check symptoms, or prepare for your next appointment. MediAI gives general guidance and helps you decide what to do next.</p>
            <Link to="/patient/ai-assistant" className="relative mt-7 inline-flex rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-600">Ask MediAI <span className="ml-2">→</span></Link>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-xl text-primary-700">◷</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Ready</span></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Next appointment</p>
            <p className="mt-2 text-lg font-extrabold text-[#082b3a] dark:text-white">Nothing scheduled</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Choose a specialist and reserve a time that suits you.</p>
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-xl font-extrabold text-[#082b3a] dark:text-white">Your healthcare tools</h2>
          <p className="mt-1 text-sm text-slate-500">Quick access to the things you use most.</p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {quickLinks.map((item) => (
              <Link key={item.to} to={item.to} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary-100 hover:shadow-clinical dark:border-gray-800 dark:bg-gray-900">
                <div className="relative h-32 overflow-hidden"><img src={item.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#082b3a]/45 to-transparent"/><span className="absolute bottom-3 left-4 grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary-700 shadow-lg"><Icon name={item.icon}/></span></div>
                <div className="p-6"><h3 className="font-extrabold text-[#082b3a] dark:text-white">{item.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{item.desc}</p>
                <p className="mt-5 text-sm font-bold text-primary-700">{item.action} <span className="inline-block transition group-hover:translate-x-1">→</span></p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-9 grid gap-4 sm:grid-cols-3">
          {careTools.map((tool) => <Link key={tool.title} to={tool.to} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-100 dark:border-gray-800 dark:bg-gray-900"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><Icon name={tool.icon}/></span><span><strong className="block text-sm text-[#082b3a] dark:text-white">{tool.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{tool.desc}</span></span></Link>)}
        </section>
      </main>
    </div>
  );
}
