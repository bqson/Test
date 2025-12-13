"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, DollarSign, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export const Trips: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      // Get user's id_user
      const { data: accountData } = await supabase
        .from("account")
        .select("id_user")
        .eq("email", user!.email || "")
        .maybeSingle();

      if (!accountData?.id_user) {
        setLoading(false);
        return;
      }

      // Get trips user has joined
      const { data: joinTrips, error: joinError } = await supabase
        .from("join_trip")
        .select("id_trip")
        .eq("id_user", accountData.id_user);

      if (joinError) throw joinError;

      const tripIds = joinTrips?.map((j) => j.id_trip) || [];

      if (tripIds.length === 0) {
        setTrips([]);
        setLoading(false);
        return;
      }

      // Get trip details
      const { data, error } = await supabase
        .from("trip")
        .select("*")
        .in("id_trip", tripIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data
      const transformedTrips = (data || []).map((trip: any) => ({
        ...trip,
        id: trip.uuid,
        currency: "VND", // Default currency
        routes: null, // Routes are separate, can be fetched if needed
      }));

      setTrips(transformedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-users/20 text-users";
      case "ongoing":
        return "bg-traveller/20 text-traveller";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trip"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
            <p className="text-muted-foreground mt-2">
              Manage your travel plans and budgets
            </p>
          </div>
          <Link
            href="/trips/new"
            className="flex items-center space-x-2 bg-trip hover:bg-trip/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">
                  {trip.title}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    trip.status
                  )}`}
                >
                  {trip.status}
                </span>
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {trip.description}
              </p>

              <div className="space-y-2 mb-4">
                {trip.start_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(trip.start_date).toLocaleDateString()} -{" "}
                    {trip.end_date
                      ? new Date(trip.end_date).toLocaleDateString()
                      : "TBD"}
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {trip.spent_amount} / {trip.total_budget} {trip.currency}
                </div>
                {trip.departure && trip.destination && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {trip.departure} → {trip.destination}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-trip rounded-full h-2"
                    style={{
                      width: `${Math.min(
                        (trip.spent_amount / trip.total_budget) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {((trip.spent_amount / trip.total_budget) * 100).toFixed(0)}%
                  of budget used
                </p>
              </div>
            </Link>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No trips yet
            </h3>
            <p className="text-muted-foreground">
              Start planning your next adventure!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
