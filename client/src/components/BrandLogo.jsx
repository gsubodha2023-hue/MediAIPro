import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/", light = false, compact = false }) {
  return (
    <Link to={to} className="inline-flex shrink-0 items-center gap-3" aria-label="MediAI Pro home">
      <svg className="h-10 w-10 drop-shadow-sm" viewBox="0 0 48 48" role="img" aria-hidden="true">
        <defs><linearGradient id="brandGradient" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse"><stop stopColor="#14B8C8"/><stop offset="1" stopColor="#087487"/></linearGradient></defs>
        <rect width="48" height="48" rx="14" fill="url(#brandGradient)"/>
        <path d="M20.5 11.5h7v9h9v7h-9v9h-7v-9h-9v-7h9v-9Z" fill="white"/>
        <path d="M14 34c5.4-1.2 7.6-4.2 10-9 2.4 4.8 4.6 7.8 10 9" fill="none" stroke="#CFF7FB" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      {!compact && <span className={`text-xl font-extrabold tracking-[-0.035em] ${light ? "text-white" : "text-[#082b3a] dark:text-white"}`}>MediAI <span className="text-primary-500">Pro</span></span>}
    </Link>
  );
}
