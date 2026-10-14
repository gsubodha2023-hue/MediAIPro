// Shared by Login and Register so both pages have a consistent split-screen
// look: a photo panel (hidden on mobile, where screen space is tight) plus
// whatever form gets passed in as children.
import authImage from "../assets/auth-clinician.webp";
import BrandLogo from "./BrandLogo.jsx";

export default function AuthLayout({ children, quote }) {
  return (
    <div className="min-h-screen flex bg-[#f5fafb]">
      <div className="hidden md:block md:w-[48%] relative overflow-hidden">
        <img
          src={authImage}
          alt="Healthcare professional in a modern clinic"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#082b3a]/90 via-[#082b3a]/10 to-transparent" />
        <div className="absolute left-10 top-9"><BrandLogo light /></div>
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <div className="mb-5 h-1 w-12 rounded-full bg-primary-500" />
          <p className="max-w-lg text-2xl font-semibold leading-snug">{quote}</p>
          <p className="mt-4 text-sm text-white/70">Healthcare that respects your time.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        {children}
      </div>
    </div>
  );
}
