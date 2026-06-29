"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUserByEmail, editProfile } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Shield, CheckCircle, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, loginUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch the latest user profile details (like phone number) from backend
    const fetchUserProfile = async () => {
      try {
        const response = await getUserByEmail(user.email);
        if (response.data) {
          const userData = response.data;
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setPhoneNumber(userData.phoneNumber || "");
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
        // Fallback to context user details
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await editProfile(user.email, {
        firstName,
        lastName,
        phoneNumber,
      });

      if (response.data) {
        // Update local session context and localStorage
        loginUser({
          ...user,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-lg bg-black/60 border-slate-700/50 text-white backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-700/40">
          <CardTitle className="text-2xl font-bold flex items-center gap-2.5">
            <User className="h-6 w-6 text-sky-400" />
            Manage Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Success / Error alerts */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-lg text-sm font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* Email Field (Disabled) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                Email Address (Permanent)
              </Label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-slate-900/60 border-slate-700 text-slate-400 cursor-not-allowed font-medium rounded-lg"
              />
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-sky-400" />
                Account Role
              </Label>
              <Input
                type="text"
                value={user?.role || "USER"}
                disabled
                className="bg-slate-900/60 border-slate-700 text-slate-400 cursor-not-allowed font-semibold rounded-lg"
              />
            </div>

            {/* Grid of First and Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-black/40 border-slate-700 text-white focus:border-sky-500 rounded-lg placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-black/40 border-slate-700 text-white focus:border-sky-500 rounded-lg placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-sky-400" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="text"
                placeholder="e.g. +91 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-black/40 border-slate-700 text-white focus:border-sky-500 rounded-lg placeholder:text-slate-500"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={updating}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold shadow-md rounded-lg py-5 transition-all duration-200"
            >
              {updating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
