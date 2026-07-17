"use client";

import SearchWidget from "@/components/SearchWidget";
import RecommendationSection from "@/components/pages/RecommendationSection";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-24 flex flex-col items-center min-h-[calc(100vh-12rem)] space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Explore the World
        </h1>
        <p className="text-lg md:text-xl text-slate-100 font-medium drop-shadow-md">
          Book flight tickets and premium hotels at affordable prices. Manage all your reservations in one place.
        </p>
      </div>

      {/* Floating Category Search Widget */}
      <SearchWidget />

      {/* Personalized Recommendations */}
      <RecommendationSection />
    </main>
  );
}
