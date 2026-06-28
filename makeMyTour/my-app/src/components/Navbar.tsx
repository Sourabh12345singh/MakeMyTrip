"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, LogOut, User, Shield, Briefcase } from "lucide-react";

export default function Navbar() {
  const { user, logoutUser, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MakeMyTrip
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/flight"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Plane className="h-4 w-4" />
              Flights
            </Link>
            <Link
              href="/hotels"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Hotel className="h-4 w-4" />
              Hotels
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/bookings"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                My Bookings
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2 border-l pl-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Hi, {user.firstName}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
