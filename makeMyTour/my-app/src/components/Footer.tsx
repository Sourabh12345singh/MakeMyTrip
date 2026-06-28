"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-[#e5e5e5] text-slate-700">
      {/* Top Section - 3 columns */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed text-slate-600">
          {/* Column 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Educational Clone Project</h4>
            <p>
              This is a full-stack clone of MakeMyTrip created solely for educational and learning purposes. It demonstrates frontend integration using Next.js, tailwind CSS, and shadcn UI, along with a Spring Boot REST API backend powered by MongoDB Atlas. All content, logos, and features are simulated for training.
            </p>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Learning Outcomes</h4>
            <p>
              By building this project, we explored core developer concepts such as REST API design, cross-origin resource sharing (CORS), client-side state management with React Context, programmatic navigation, environment configuration, database mapping, and password encryption using BCrypt.
            </p>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Disclaimer</h4>
            <p>
              MakeMyTrip is a registered trademark of MakeMyTrip India Pvt. Ltd. This cloned application is not affiliated with, authorized, or endorsed by MakeMyTrip. No commercial bookings or actual financial transactions take place in this system.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Black Footer bar */}
      <div className="w-full bg-black py-8 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-white hover:text-slate-300 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.012 3.82.058 1.036.047 1.745.208 2.368.45a4.761 4.761 0 011.666 1.086 4.761 4.761 0 011.085 1.666c.243.624.404 1.332.45 2.368.047 1.036.059 1.39.059 3.82 0 2.43-.012 2.784-.058 3.82-.047 1.036-.208 1.745-.45 2.368a4.757 4.757 0 01-1.086 1.666 4.757 4.757 0 01-1.666 1.085c-.624.243-1.332.404-2.368.45-1.036.047-1.39.059-3.82.059-2.43 0-2.784-.012-3.82-.058-1.036-.047-1.745-.208-2.368-.45a4.757 4.757 0 01-1.666-1.085 4.757 4.757 0 01-1.085-1.666c-.243-.624-.404-1.332-.45-2.368-.047-1.036-.059-1.39-.059-3.82 0-2.43.012-2.784.058-3.82.047-1.036.208-1.745.45-2.368a4.761 4.761 0 011.086-1.666 4.761 4.761 0 011.666-1.085c.624-.243 1.332-.404 2.368-.45 1.036-.047 1.39-.059 3.82-.059zM12 7.25a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5zM12 14.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm6.5-7.375a.875.875 0 100-1.75.875.875 0 000 1.75z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-slate-300 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-slate-300 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-slate-300 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-slate-400 text-xs font-semibold">
            © 2026 MAKEMYTRIP CLONE. LEARNING USE ONLY.
          </div>
        </div>
      </div>
    </footer>
  );
}
