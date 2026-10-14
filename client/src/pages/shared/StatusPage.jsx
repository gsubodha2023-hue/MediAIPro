import { Link } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo.jsx";
import Icon from "../../components/Icon.jsx";
import heroImage from "../../assets/hero-clinic.webp";

export default function StatusPage({ type = "not-found" }) {
  const unauthorized = type === "unauthorized";
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f9fa] px-5 py-12">
      <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-primary-50/90" />
      <section className="relative z-10 w-full max-w-xl rounded-[2rem] border border-white bg-white/95 p-8 text-center shadow-clinical backdrop-blur sm:p-12">
        <div className="flex justify-center"><BrandLogo /></div>
        <span className="mx-auto mt-9 grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary-700"><Icon name={unauthorized ? "shield" : "records"} className="h-8 w-8" /></span>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[.2em] text-primary-700">{unauthorized ? "Secure area" : "Error 404"}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#082b3a]">{unauthorized ? "You don’t have access" : "Page not found"}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">{unauthorized ? "This page is protected for another user role. Sign in with the correct account or return to the homepage." : "The page may have moved or the address may be incorrect. Let’s get you back to a safe place."}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/" className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700">Return home</Link><Link to="/login" className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-[#082b3a] transition hover:bg-slate-50">Sign in</Link></div>
      </section>
    </main>
  );
}
