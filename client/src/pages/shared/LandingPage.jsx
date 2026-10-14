import { Link } from "react-router-dom";
import DarkModeToggle from "../../components/DarkModeToggle.jsx";
import heroImage from "../../assets/hero-clinic.webp";
import BrandLogo from "../../components/BrandLogo.jsx";
import Icon from "../../components/Icon.jsx";

const FeatureIcon = ({ children }) => (
  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-50 text-xl text-primary-700">
    {children}
  </span>
);

const features = [
  {
    icon: "✦",
    title: "AI health guidance",
    desc: "Get clear, responsible answers about symptoms, medications and lab results, any time.",
  },
  {
    icon: "◷",
    title: "Appointments in seconds",
    desc: "Choose a verified doctor, select a convenient slot and manage every visit online.",
  },
  {
    icon: "⌁",
    title: "One secure health record",
    desc: "Keep diagnoses, prescriptions and reports organized in a protected medical timeline.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#082b3a] dark:bg-gray-950 dark:text-white">
      <header className="relative z-30 border-b border-slate-100/80 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="hidden items-center gap-9 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#solutions" className="transition hover:text-primary-700">Solutions</a>
            <a href="#patients" className="transition hover:text-primary-700">For patients</a>
            <a href="#security" className="transition hover:text-primary-700">Security</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DarkModeToggle />
            <Link to="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:block dark:text-slate-200 dark:hover:bg-gray-900">Sign in</Link>
            <Link to="/register" className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-0.5 hover:bg-primary-700">Get started</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
          <div className="reveal relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                <Icon name="shield" className="h-5 w-5" />
              Trusted care, made simpler
            </div>
            <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[4.35rem]">
              Intelligent healthcare, <span className="text-primary-600">without the wait.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Book appointments in seconds, get reliable support from your AI health assistant, and access your medical records securely—all in one place.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="rounded-xl bg-primary-600 px-7 py-3.5 text-center text-sm font-bold text-white shadow-clinical transition hover:-translate-y-0.5 hover:bg-primary-700">Create your account</Link>
              <a href="#solutions" className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-center text-sm font-bold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-900">Explore solutions</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
              <span>✓ No waiting on hold</span><span>✓ Your data stays protected</span>
            </div>
          </div>

          <div className="reveal reveal-delay relative lg:-mr-16">
            <div className="overflow-hidden rounded-[2rem] rounded-tr-none bg-primary-50 shadow-[0_32px_80px_-30px_rgba(8,43,58,.38)]">
              <img src={heroImage} alt="Doctor speaking with a patient in a modern clinic" className="h-[520px] w-full object-cover object-center" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#082b3a]/35 to-transparent" />
            </div>
            <div className="absolute -left-5 top-28 hidden w-60 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-clinical backdrop-blur md:block">
            <div className="flex items-start gap-3"><FeatureIcon>◷</FeatureIcon><div><p className="text-xs font-bold text-slate-500">UPCOMING APPOINTMENT</p><p className="mt-1 text-sm font-bold">Today · 10:30 AM</p><p className="text-xs text-slate-500">Dr. Priya Sharma</p></div></div>
            </div>
            <div className="absolute -bottom-5 right-8 hidden max-w-sm items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-clinical backdrop-blur sm:flex">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-600 text-lg text-white">✦</span>
              <div><p className="text-sm font-bold">Your AI health assistant is ready</p><p className="text-xs text-slate-500">Private, clear guidance when you need it.</p></div>
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto -mt-1 max-w-7xl px-5 pb-16 sm:px-8">
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-clinical md:grid-cols-3 dark:border-gray-800 dark:bg-gray-900">
            {[["◇","Privacy and security first","Protected health information and secure access."],["◎","Verified clinicians","Care from qualified healthcare professionals."],["◉","Support that stays available","Manage your care from any device, any time."]].map(([icon,title,desc]) => (
              <div key={title} className="flex gap-4 rounded-2xl p-4"><FeatureIcon>{icon}</FeatureIcon><div><h2 className="text-sm font-extrabold">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p></div></div>
            ))}
          </div>
        </section>

        <section id="solutions" className="bg-[#f4fafb] py-20 dark:bg-gray-900/60">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-extrabold uppercase tracking-[.18em] text-primary-600">One connected platform</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything you need to manage your health</h2><p className="mt-4 text-slate-600 dark:text-slate-300">Designed to remove friction from everyday healthcare while keeping people at the center.</p></div>
            <div id="patients" className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-clinical dark:border-gray-800 dark:bg-gray-900">
                  <FeatureIcon>{feature.icon}</FeatureIcon><h3 className="mt-6 text-lg font-extrabold">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.desc}</p><span className="mt-6 inline-flex text-sm font-bold text-primary-700">Learn more <span className="ml-2 transition group-hover:translate-x-1">→</span></span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white py-9 text-center text-xs leading-5 text-slate-500 dark:border-gray-800 dark:bg-gray-950">
        <p className="font-bold text-[#082b3a] dark:text-white">MediAI Pro</p>
        <p className="mt-1">General health support only. Not a substitute for professional medical advice or emergency care.</p>
      </footer>
    </div>
  );
}
