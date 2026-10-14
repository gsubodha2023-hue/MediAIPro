// Generates a consistent, colorful initials-based avatar for any name.
// Using generated avatars (rather than stock photos of real people) for
// doctor/patient profile pictures avoids any real-person likeness or
// consent concerns in a healthcare app - a deliberate choice, not a placeholder hack.
export const avatarUrl = (name, size = 96) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&size=${size}&background=2563eb&color=fff&bold=true`;
