// src/components/FormNewTrip.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { ITrip } from "./Trips";
import { useAuth } from "../../contexts/AuthContext";

// --- INTERFACE IDestination ---
export interface IDestination {
  id?: string;
  region_id: string;
  name: string;
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

interface FormNewTripProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: () => void;
}

// Định nghĩa các lựa chọn status hợp lệ
const TRIP_STATUS_OPTIONS: ITrip["status"][] = [
  "planning",
  "ongoing",
  "completed",
  "cancelled",
];

export const FormNewTrip: React.FC<FormNewTripProps> = ({
  isOpen,
  onClose,
  onTripCreated,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<ITrip>>({
    title: "",
    destination_id: "",
    description: "",
    start_date: "",
    end_date: "",
    total_budget: 0,
    distance: 0,
    departure: "",
    difficult: 1,
    spent_amount: 0,
    status: "planning", // Giữ giá trị mặc định là 'planning'
  });

  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDestinations, setFetchingDestinations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isOpen) {
      // Đặt lại form khi mở modal
      setFormData({
        title: "",
        destination_id: "",
        description: "",
        start_date: "",
        end_date: "",
        total_budget: 0,
        distance: 0,
        departure: "",
        difficult: 1,
        spent_amount: 0,
        status: "planning", // Đảm bảo reset status về planning
      });
      setError(null);
      fetchDestinations();
    } else {
      setDestinations([]);
    }
  }, [isOpen]);

  const fetchDestinations = async () => {
    if (!API_URL) return;
    setFetchingDestinations(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/destinations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch destinations (Status: ${response.status})`
        );
      }

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        setDestinations(result.data);
      } else {
        throw new Error("Invalid response format from destinations API");
      }
    } catch (err: any) {
      console.error("Error fetching destinations:", err);
      setError(`Failed to load destinations: ${err.message}.`);
    } finally {
      setFetchingDestinations(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Xử lý status: đảm bảo giá trị là string, không cần parseFloat
      [name]:
        name === "total_budget" || name === "distance" || name === "difficult"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!API_URL) {
      setError("API URL is not configured.");
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    if (!formData.destination_id) {
      setError("Please select a destination to create a trip.");
      setLoading(false);
      return;
    }

    try {
      // Chuẩn bị payload cho Trip
      const tripPayload: Omit<
        ITrip,
        | "id"
        | "created_at"
        | "updated_at"
        | "spent_amount"
        | "currency"
        | "destination"
      > = {
        title: formData.title!,
        destination_id: formData.destination_id!,
        description: formData.description!,
        departure: formData.departure!,
        distance: formData.distance!,
        start_date: formData.start_date!,
        end_date: formData.end_date!,
        difficult: formData.difficult!,
        total_budget: formData.total_budget!,
        status: formData.status || "planning", // Bổ sung status từ form
      };

      // Bước 1: Tạo Trip
      const tripResponse = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripPayload),
      });

      if (!tripResponse.ok) {
        const errorData = await tripResponse.json();
        throw new Error(
          errorData.message ||
            `Failed to create trip. Status: ${tripResponse.status}`
        );
      }

      const tripResult = await tripResponse.json();

      // API trả về {status, message, data: {...}}
      const createdTrip: ITrip = tripResult.data || tripResult;

      if (!createdTrip.id) {
        throw new Error("Trip created but ID is missing.");
      }

      // Bước 2: Thêm user vào trip (tạo join_trip)
      const joinTripResponse = await fetch(
        `${API_URL}/trips/${createdTrip.id}/users/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!joinTripResponse.ok) {
        // Nếu thêm user vào trip thất bại, nên xóa trip đã tạo (rollback)
        // Lưu ý: Cần đảm bảo API cho phép DELETE trip mà không cần join_trip
        await fetch(`${API_URL}/trips/${createdTrip.id}`, {
          method: "DELETE",
        });
        const errorData = await joinTripResponse.json();
        throw new Error(
          errorData.message ||
            `Failed to add user to trip. Status: ${joinTripResponse.status}`
        );
      }

      // Thành công
      onTripCreated();
      onClose();
    } catch (err: any) {
      setError(
        err.message || "An unknown error occurred during trip creation."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDisabled = loading || fetchingDestinations;
  const isFormDisabled = isDisabled || destinations.length === 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Plan New Trip</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <p className="text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/50">
              {error}
            </p>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Trip Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isFormDisabled}
              className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Destination Select */}
          <div>
            <label
              htmlFor="destination_id"
              className="block text-sm font-medium text-foreground mb-1"
            >
              <MapPin className="w-4 h-4 mr-2 inline-block text-trip" />
              Select Destination
            </label>
            {fetchingDestinations ? (
              <div className="flex items-center justify-center p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading destinations...
              </div>
            ) : destinations.length > 0 ? (
              <select
                id="destination_id"
                name="destination_id"
                value={formData.destination_id}
                onChange={handleChange}
                required
                disabled={isDisabled}
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  -- Choose a Destination --
                </option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name} ({dest.country})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-red-100/20 rounded-lg text-sm text-destructive border border-destructive/50">
                No destinations available. Check the API or server logs.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              disabled={isFormDisabled}
              className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Dates, Budget, Difficulty, and Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Start Date
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
                disabled={isFormDisabled}
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="end_date"
                className="block text-sm font-medium text-foreground mb-1"
              >
                End Date
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
                disabled={isFormDisabled}
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Total Budget */}
            <div>
              <label
                htmlFor="total_budget"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Total Budget (VND)
              </label>
              <input
                id="total_budget"
                name="total_budget"
                type="number"
                value={formData.total_budget}
                onChange={handleChange}
                required
                min="0"
                disabled={isFormDisabled}
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Status Select (MỚI) */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Initial Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={isFormDisabled}
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {TRIP_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty (Di chuyển xuống hàng dưới) */}
            <div>
              <label
                htmlFor="difficult"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Difficulty (1-5)
              </label>
              <input
                id="difficult"
                name="difficult"
                type="number"
                value={formData.difficult}
                onChange={handleChange}
                required
                min="1"
                max="5"
                disabled={isFormDisabled}
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Departure */}
          <div>
            <label
              htmlFor="departure"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Departure Location
            </label>
            <input
              id="departure"
              name="departure"
              type="text"
              value={formData.departure}
              onChange={handleChange}
              disabled={isFormDisabled}
              placeholder="e.g., Ho Chi Minh City"
              className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Distance */}
          <div>
            <label
              htmlFor="distance"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Distance (km)
            </label>
            <input
              id="distance"
              name="distance"
              type="number"
              value={formData.distance}
              onChange={handleChange}
              min="0"
              disabled={isFormDisabled}
              placeholder="e.g., 1500"
              className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:ring-trip focus:border-trip transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submission */}
          <button
            type="submit"
            disabled={isFormDisabled}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white font-semibold transition-colors ${
              isFormDisabled
                ? "bg-trip/60 cursor-not-allowed"
                : "bg-trip hover:bg-trip/90 shadow-lg shadow-trip/40"
            }`}
          >
            {isDisabled && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>
              {fetchingDestinations
                ? "Loading destinations..."
                : loading
                ? "Creating trip..."
                : "Create Trip"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
