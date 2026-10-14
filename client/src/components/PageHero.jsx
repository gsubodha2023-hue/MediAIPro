export default function PageHero({ image, eyebrow, title, description, children }) {
  return (
    <section className="relative mb-8 min-h-52 overflow-hidden rounded-[2rem] bg-[#082b3a] shadow-clinical">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#082b3a] via-[#082b3a]/90 to-[#082b3a]/20" />
      <div className="relative z-10 max-w-xl p-7 text-white sm:p-9">
        {eyebrow && <p className="text-xs font-extrabold uppercase tracking-[.2em] text-primary-100">{eyebrow}</p>}
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-3 text-sm leading-6 text-slate-200">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}
