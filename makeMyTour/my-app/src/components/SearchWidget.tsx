"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("flights");
  
  // Flights Form State
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [flightDate, setFlightDate] = useState("");

  // Hotels Form State
  const [hotelLocation, setHotelLocation] = useState("");
  const [hotelRooms, setHotelRooms] = useState(1);

  const handleSearch = () => {
    if (activeTab === "flights") {
      router.push(`/flight?from=${encodeURIComponent(flightFrom)}&to=${encodeURIComponent(flightTo)}`);
    } else if (activeTab === "hotels") {
      router.push(`/hotels?location=${encodeURIComponent(hotelLocation)}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative z-10 px-4">
      {/* Floating Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 pb-12">
        {/* Navigation Tabs (Only Flights and Hotels) */}
        <div className="flex border-b border-slate-100 pb-4 gap-8">
          <button
            onClick={() => setActiveTab("flights")}
            className={`flex items-center gap-2 pb-2 relative transition-all duration-200 outline-none text-sm font-bold ${
              activeTab === "flights" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Plane className="h-5 w-5" />
            Flights
            {activeTab === "flights" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("hotels")}
            className={`flex items-center gap-2 pb-2 relative transition-all duration-200 outline-none text-sm font-bold ${
              activeTab === "hotels" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Hotel className="h-5 w-5" />
            Hotels
            {activeTab === "hotels" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
            {activeTab === "flights" ? "Book Domestic and International Flights" : "Book Premium Hotels Worldwide"}
          </p>

          {activeTab === "flights" && (
            <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* FROM field */}
              <div className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  FROM
                </span>
                <input
                  type="text"
                  placeholder="e.g. Delhi (DEL)"
                  value={flightFrom}
                  onChange={(e) => setFlightFrom(e.target.value)}
                  className="bg-transparent border-0 outline-none text-base font-bold text-slate-800 placeholder:text-slate-400 w-full"
                />
              </div>

              {/* TO field */}
              <div className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  TO
                </span>
                <input
                  type="text"
                  placeholder="e.g. Mumbai (BOM)"
                  value={flightTo}
                  onChange={(e) => setFlightTo(e.target.value)}
                  className="bg-transparent border-0 outline-none text-base font-bold text-slate-800 placeholder:text-slate-400 w-full"
                />
              </div>

              {/* DEPARTURE DATE field */}
              <div className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  DEPARTURE DATE
                </span>
                <input
                  type="text"
                  placeholder="e.g. 15 July"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-base font-bold text-slate-800 placeholder:text-slate-400 w-full"
                />
              </div>
            </div>
          )}

          {activeTab === "hotels" && (
            <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* CITY/LOCATION field */}
              <div className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  CITY, AREA OR PROPERTY
                </span>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={hotelLocation}
                  onChange={(e) => setHotelLocation(e.target.value)}
                  className="bg-transparent border-0 outline-none text-base font-bold text-slate-800 placeholder:text-slate-400 w-full"
                />
              </div>

              {/* ROOMS & GUESTS field */}
              <div className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  ROOMS & GUESTS
                </span>
                <input
                  type="number"
                  min={1}
                  value={hotelRooms}
                  onChange={(e) => setHotelRooms(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-transparent border-0 outline-none text-base font-bold text-slate-800 w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating SEARCH Button */}
      <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
        <Button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold text-sm px-14 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          SEARCH
        </Button>
      </div>
    </div>
  );
}
