"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Hotel } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center max-w-2xl mb-12 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Explore the World with MakeMyTrip
        </h1>
        <p className="text-lg text-muted-foreground">
          Book flight tickets and premium hotels at affordable prices. Manage all your reservations in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/flight" className="group">
          <Card className="h-full border-2 border-transparent group-hover:border-blue-500 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Plane className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-semibold">Book Flights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Find the best deals on domestic and international flights. Get realtime seat availability and instant confirmation.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/hotels" className="group">
          <Card className="h-full border-2 border-transparent group-hover:border-indigo-500 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Hotel className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-semibold">Book Hotels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Choose from thousands of luxury and pocket-friendly hotels worldwide. Explore great amenities and locations.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
