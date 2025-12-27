// src/components/TripCard.tsx
import React from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Gauge,
} from "lucide-react";
import { ITrip } from "./Trips";

interface TripCardProps {
  trip: ITrip;
  onEdit: () => void;
  onDelete: () => void;
}

// Cải thiện màu sắc Status
const getStatusColor = (status: ITrip["status"]) => {
  switch (status) {
    case "planning":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400";
    case "ongoing":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400";
    case "completed":
      return "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400";
    case "cancelled":
      return "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/30 dark:text-gray-500";
  }
};

const formatCurrency = (amount: number, currency: string = "VND") => {
  const safeAmount = amount || 0;
  // For VND, format without currency symbol prefix to avoid confusion
  if (currency === "VND" || currency === "vnd") {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount) + " ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(safeAmount);
};

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onDelete,
}) => {
  const percentageUsed = Math.min(
    trip.total_budget > 0 ? (trip.spent_amount / trip.total_budget) * 100 : 0,
    100
  );

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  // Tính số ngày bao gồm ngày bắt đầu và ngày kết thúc
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // SỬA LỖI: Kiểm tra an toàn cho trip.destination
  const destinationName = trip.destination?.name || "Unknown Destination";

  const difficultLevel = trip.difficult || 0;
  const isDifficult = difficultLevel >= 3;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 block relative group overflow-hidden">
      {/* Header Section with Title and Actions */}
      <div className="relative p-5 pb-4">
        {/* Action Buttons - Better positioned */}
        <div className="absolute top-4 right-4 flex space-x-1.5 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-all duration-200 shadow-sm border border-gray-200 hover:border-blue-300"
            title="Edit Trip"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all duration-200 shadow-sm border border-gray-200 hover:border-red-300"
            title="Delete Trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <Link href={`/trips/${trip.id}`} className="block">
          {/* Title and Status */}
          <div className="pr-20 mb-3">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
              {trip.title}
            </h3>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {destinationName}
            </span>
            <span
              className={`ml-auto text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(
                trip.status
              )}`}
            >
              {(trip.status || "UNKNOWN").toUpperCase()}
            </span>
          </div>
        </Link>
      </div>

      {/* Content Section */}
      <Link href={`/trips/${trip.id}`} className="block">
        <div className="px-5 pb-5 space-y-4">
          {/* Key Info Row - Compact */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate">
                {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
            </div>
          </div>

          {/* Budget Section - Cleaner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-green-600" />
                Budget
              </span>
              <span className="text-gray-900 font-semibold">
                {formatCurrency(trip.spent_amount, trip.currency)} / {formatCurrency(trip.total_budget, trip.currency)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  percentageUsed > 100 
                    ? "bg-red-500" 
                    : percentageUsed > 80 
                    ? "bg-yellow-500" 
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(percentageUsed, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className="font-semibold text-gray-700">{percentageUsed.toFixed(0)}%</span>
            </div>
          </div>

          {/* Additional Info - Only if needed */}
          {(trip.departure || difficultLevel > 0) && (
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 text-xs">
              {trip.departure && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{trip.departure}</span>
                </div>
              )}
              {difficultLevel > 0 && (
                <div className="flex items-center gap-1.5">
                  <Gauge className={`w-3.5 h-3.5 ${isDifficult ? "text-red-500" : "text-green-500"}`} />
                  <span className={`font-medium ${isDifficult ? "text-red-600" : "text-green-600"}`}>
                    {difficultLevel}/5
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
