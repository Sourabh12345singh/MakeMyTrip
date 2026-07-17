"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { recommendationAPI, Recommendation } from "@/services/recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Plane,
  Hotel,
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Star,
  MapPin,
  IndianRupee,
  Users,
  TrendingUp,
  LogIn,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  destination_preference: <MapPin className="h-3.5 w-3.5" />,
  price_range: <IndianRupee className="h-3.5 w-3.5" />,
  high_rating: <Star className="h-3.5 w-3.5" />,
  collaborative: <Users className="h-3.5 w-3.5" />,
  popular: <TrendingUp className="h-3.5 w-3.5" />,
};

const categoryLabels: Record<string, string> = {
  destination_preference: "Based on your destinations",
  price_range: "Matches your budget",
  high_rating: "Highly rated",
  collaborative: "Travelers like you",
  popular: "Trending now",
};

export default function RecommendationSection() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "Flight" | "Hotel">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.email) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  const fetchRecommendations = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await recommendationAPI.getRecommendations(user.email);
      setRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.email) return;
    setRefreshing(true);
    try {
      const data = await recommendationAPI.generateRecommendations(user.email);
      setRecommendations(data);
      setFeedbackGiven({});
    } catch (error) {
      console.error("Failed to refresh recommendations:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFeedback = async (recId: string, type: string) => {
    if (!user?.email) return;
    try {
      await recommendationAPI.submitFeedback(recId, user.email, type);
      setFeedbackGiven((prev) => ({ ...prev, [recId]: type }));
      if (type === "irrelevant") {
        setRecommendations((prev) => prev.filter((r) => r.id !== recId));
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const filteredRecs = recommendations.filter(
    (r) => filter === "all" || r.entityType === filter
  );

  // Not logged in state
  if (!user) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-black/30 backdrop-blur-md border border-slate-700/40 rounded-2xl p-8 text-center">
          <Sparkles className="h-12 w-12 text-sky-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Personalized Recommendations
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Sign in to get tailored flight and hotel recommendations based on
            your travel history and preferences.
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
          >
            <LogIn className="h-4 w-4" /> Sign In to Get Started
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <Sparkles className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Recommended for You
              </h2>
              <p className="text-sm text-slate-400">
                Personalized picks based on your travel history
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "Flight", "Hotel"] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab)}
            className={`gap-1.5 ${
              filter === tab
                ? "bg-sky-500 hover:bg-sky-600 text-white"
                : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab === "all" && <Sparkles className="h-3.5 w-3.5" />}
            {tab === "Flight" && <Plane className="h-3.5 w-3.5" />}
            {tab === "Hotel" && <Hotel className="h-3.5 w-3.5" />}
            {tab === "all" ? "All" : tab + "s"}
          </Button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="animate-pulse bg-black/30 backdrop-blur-md border border-slate-700/30 rounded-xl h-72"
            />
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-md border border-slate-700/40 rounded-2xl p-12 text-center">
          <Sparkles className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">
            No recommendations yet
          </h3>
          <p className="text-slate-400 mb-4">
            Book some flights or hotels and we&apos;ll start suggesting
            personalized options!
          </p>
          <Button
            onClick={handleRefresh}
            className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Generate Recommendations
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecs.map((rec, index) => (
            <Card
              key={rec.id}
              className="group bg-black/40 backdrop-blur-md border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 overflow-hidden"
              style={{
                animationDelay: `${index * 80}ms`,
                animation: "fadeInUp 0.5s ease-out forwards",
                opacity: 0,
              }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={rec.imageUrl}
                  alt={rec.entityName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/seed/${rec.entityId}/400/250`;
                  }}
                />
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      rec.entityType === "Flight"
                        ? "bg-sky-500/80 text-white"
                        : "bg-emerald-500/80 text-white"
                    }`}
                  >
                    {rec.entityType === "Flight" ? (
                      <Plane className="h-3 w-3" />
                    ) : (
                      <Hotel className="h-3 w-3" />
                    )}
                    {rec.entityType}
                  </span>
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-black/60 text-slate-300 backdrop-blur-sm">
                    {categoryIcons[rec.reasonCategory]}
                    {categoryLabels[rec.reasonCategory] || rec.reasonCategory}
                  </span>
                </div>
                {/* Score Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-300"
                    style={{ width: `${rec.score * 100}%` }}
                  />
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Title Row */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                    {rec.entityName}
                  </h3>
                  <button 
                    title={`Why this recommendation?\n\n${rec.reason}`}
                    className="shrink-0 p-1 rounded-full hover:bg-slate-700/50 transition-colors"
                  >
                    <Info className="h-4 w-4 text-sky-400" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  {rec.metadata?.price != null && (
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />₹
                      {Number(rec.metadata.price).toLocaleString()}
                    </span>
                  )}
                  {rec.metadata?.pricePerNight != null && (
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />₹
                      {Number(rec.metadata.pricePerNight).toLocaleString()}
                      /night
                    </span>
                  )}
                  {rec.metadata?.from && rec.metadata?.to && (
                    <span className="flex items-center gap-1">
                      <Plane className="h-3 w-3" />
                      {rec.metadata.from} → {rec.metadata.to}
                    </span>
                  )}
                  {rec.metadata?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {rec.metadata.location}
                    </span>
                  )}
                  {rec.metadata?.avgRating != null && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-3 w-3 fill-current" />
                      {rec.metadata.avgRating}
                      {rec.metadata?.reviewCount != null &&
                        ` (${rec.metadata.reviewCount})`}
                    </span>
                  )}
                  {rec.metadata?.similarTravelers != null && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {rec.metadata.similarTravelers} similar
                    </span>
                  )}
                </div>

                {/* Reason text (abbreviated) */}
                <p className="text-xs text-slate-500 italic line-clamp-2">
                  {rec.reason}
                </p>

                {/* Feedback Buttons */}
                <div className="flex gap-2 pt-1 border-t border-slate-700/40">
                  {feedbackGiven[rec.id] ? (
                    <span className="text-xs text-sky-400 py-1">
                      ✓ Thanks for your feedback!
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeedback(rec.id, "helpful")}
                        className="text-xs text-slate-400 hover:text-green-400 hover:bg-green-500/10 gap-1 h-7"
                      >
                        <ThumbsUp className="h-3 w-3" /> Helpful
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeedback(rec.id, "irrelevant")}
                        className="text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-1 h-7"
                      >
                        <ThumbsDown className="h-3 w-3" /> Not Relevant
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
