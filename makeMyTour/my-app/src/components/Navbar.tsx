"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, LogOut, User, Shield, Briefcase, Radio } from "lucide-react";

export default function Navbar() {
  const { user, logoutUser, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-2xl text-sky-500 tracking-tight">
              MakeMyTrip
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/flight"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors"
            >
              <Plane className="h-4 w-4 text-sky-500" />
              Flights
            </Link>
            <Link
              href="/hotels"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors"
            >
              <Hotel className="h-4 w-4 text-sky-500" />
              Hotels
            </Link>
            <Link
              href="/flight-status"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors"
            >
              <Radio className="h-4 w-4 text-sky-500" />
              Live Status
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/bookings"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors"
              >
                <Briefcase className="h-4 w-4 text-slate-400" />
                My Bookings
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-500 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-sky-500 transition-colors"
                >
                  <User className="h-4 w-4 text-sky-500" />
                  <span>Hi, {user.firstName}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                  className="text-slate-500 hover:text-sky-500 hover:bg-slate-50 rounded-full"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-sky-500 hover:bg-slate-50 font-semibold">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm transition-all duration-200">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
