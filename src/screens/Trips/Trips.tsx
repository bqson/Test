// src/components/Trips.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Plus, MapPin, Edit, Trash2 } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { FormNewTrip } from "./FormNewTrip";
import { TripCard } from "./TripCard";
import { EditTripModal } from "./EditTripModal";

// --- INTERFACES ---
export interface IDestination {
  id?: string;
  region_id: string;
  name: string; // <--- Trường cần lấy
  country: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  best_season: string;
  rating: number;
  images: Array<string> | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ITrip {
  id?: string;
  destination_id: string;
  title: string;
  description: string;
  departure: string;
  distance: number;
  start_date: string;
  end_date: string;
  difficult: number;
  total_budget: number;
  spent_amount: number;
  status: "planning" | "ongoing" | "completed" | "cancelled" | string;
  created_at: string;
  updated_at: string;
  destination?: IDestination; // Thêm '?' vì ban đầu có thể chưa có
  currency?: string;
}

export interface IJoinTrip {
  user_id: string;
  trip_id: string;
  created_at: string;
}

// Hàm fetch chi tiết Destination (MỚI)
const fetchDestinationDetails = async (
  API_URL: string,
  destinationId: string
): Promise<IDestination | null> => {
  try {
    const response = await fetch(`${API_URL}/destinations/${destinationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(
        `Failed to fetch destination ${destinationId} (Status: ${response.status})`
      );
      return null;
    }

    const result = await response.json();
    // Giả định API trả về { data: IDestination } hoặc trực tiếp IDestination
    return result.data || result;
  } catch (error) {
    console.error(`Error fetching destination ${destinationId}:`, error);
    return null;
  }
};

export const Trips: React.FC = () => {
  const { user } = useAuth();

  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal Add
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State cho Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (API_URL && user?.id) {
      fetchUserTrips(user.id);
    } else if (!user) {
      setLoading(false);
    }
  }, [API_URL, user?.id]);

  /**
   * Fetch trips của user và sau đó fetch chi tiết destination nếu cần
   */
  const fetchUserTrips = async (userId: string) => {
    if (!API_URL) return;
    setLoading(true);

    try {
      // 1. Fetch danh sách trips
      const response = await fetch(`${API_URL}/users/${userId}/trips`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization header nếu cần
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user trips (Status: ${response.status})`
        );
      }

      const result = await response.json();
      let tripsData: ITrip[] = Array.isArray(result.data || result)
        ? result.data || result
        : [];

      // 2. Xử lý trường hợp API không nhúng Destination
      // Nếu tripsData không có trường `destination.name` (hoặc `destination` là null/undefined)
      // VÀ có destination_id, thì ta tiến hành fetch chi tiết.
      const tripsToFetchDestination = tripsData.filter(
        (trip) => !trip.destination && trip.destination_id
      );

      if (tripsToFetchDestination.length > 0) {
        // Tạo một mảng các Promise để fetch chi tiết Destination song song
        const destinationPromises = tripsToFetchDestination.map((trip) =>
          fetchDestinationDetails(API_URL, trip.destination_id)
        );

        const destinations = await Promise.all(destinationPromises);

        // Map lại dữ liệu trips với thông tin destination đã fetch
        tripsData = tripsData.map((trip) => {
          if (trip.destination) return trip; // Bỏ qua nếu đã có destination (API đã nhúng)

          const destinationIndex = tripsToFetchDestination.findIndex(
            (t) => t.id === trip.id
          );

          const destination = destinations[destinationIndex];

          return {
            ...trip,
            destination: destination || undefined, // Gắn destination object vào trip
          } as ITrip;
        });
      }

      setTrips(tripsData);
    } catch (error) {
      console.error("Error fetching user trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Các Handlers CRUD (giữ nguyên) ---
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleOpenEditModal = (trip: ITrip) => {
    setSelectedTrip(trip);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedTrip(null);
    setIsEditModalOpen(false);
  };

  const handleTripActionSuccess = () => {
    if (user?.id) {
      fetchUserTrips(user.id);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (
      !API_URL ||
      !user?.id ||
      !confirm(`Are you sure you want to delete this trip?`)
    )
      return;

    try {
      setLoading(true);

      // Bước 1: Xóa user khỏi trip (remove join_trip record)
      const deleteJoinTripResponse = await fetch(
        `${API_URL}/trips/${tripId}/users/${user.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!deleteJoinTripResponse.ok) {
        console.warn(
          "Could not remove user from trip (might not be joined). Proceeding to delete trip."
        );
      }

      // Bước 2: Xóa trip
      const deleteTripResponse = await fetch(`${API_URL}/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!deleteTripResponse.ok) {
        const errorText = await deleteTripResponse.text();
        throw new Error(`Failed to delete trip: ${errorText}`);
      }

      handleTripActionSuccess();
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert(
        `Error deleting trip: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic (giữ nguyên) ---
  if (loading || !user?.id) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        {!user ? (
          <p className="text-lg text-foreground">
            Please log in to view your trips.
          </p>
        ) : (
          // Sử dụng Tailwind CSS cho spinner
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-trip"></div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER - Tối ưu Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          {/* Tiêu đề */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
            <p className="text-muted-foreground mt-2">
              Manage your travel plans and budgets
            </p>
          </div>

          {/* Nút Plan New Trip - Chiếm toàn bộ chiều rộng trên màn hình nhỏ */}
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-trip hover:bg-trip/90 text-white px-4 py-2 rounded-lg transition-colors shadow-md shadow-trip/30"
          >
            <Plus className="w-5 h-5" />
            <span>Plan New Trip</span>
          </button>
        </div>

        {/* Danh sách chuyến đi - Tối ưu Responsive: sm:grid-cols-2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trips.length > 0 ? (
            trips.map((trip) => (
              // Thêm kiểm tra an toàn cho ID
              <div key={trip.id} className="relative group">
                {trip.id && (
                  <TripCard
                    trip={trip}
                    onEdit={() => handleOpenEditModal(trip)}
                    onDelete={() => handleDeleteTrip(trip.id!)}
                  />
                )}
              </div>
            ))
          ) : (
            // No Trips Message - Tối ưu Responsive: col-span-2 trên sm, 3 trên lg, 4 trên xl
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-12 bg-card rounded-lg shadow-inner">
              <MapPin className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
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

      {/* MODAL THÊM */}
      <FormNewTrip
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onTripCreated={handleTripActionSuccess}
      />

      {/* MODAL SỬA */}
      {selectedTrip && (
        <EditTripModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          trip={selectedTrip}
          onTripUpdated={handleTripActionSuccess}
        />
      )}
    </div>
  );
};
