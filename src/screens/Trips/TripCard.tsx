// src/components/TripCard.tsx
import React from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  Edit,
  Trash2,
  Gauge, // Thêm icon cho Difficulty
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
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0, // Làm gọn hơn cho số lớn
  }).format(safeAmount);
};

// Component cho một dòng chi tiết
const DetailItem: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div className="flex items-center text-sm text-muted-foreground/90">
    <span className="w-5 h-5 mr-3 flex-shrink-0">{icon}</span>
    {children}
  </div>
);

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
    // Thay đổi màu border và shadow khi hover
    <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-border hover:border-blue-500 block relative group">
      {/* Action Buttons (Luôn hiển thị nhưng mờ, sáng lên khi hover) */}
      <div className="absolute top-3 right-3 flex space-x-2 transition-opacity duration-300 opacity-20 group-hover:opacity-100 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          className="p-1.5 bg-background/80 hover:bg-blue-500 text-blue-500 hover:text-white rounded-full shadow-md transition-colors border border-border"
          title="Edit Trip"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="p-1.5 bg-background/80 hover:bg-red-500 text-red-500 hover:text-white rounded-full shadow-md transition-colors border border-border"
          title="Delete Trip"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Link href={`/trips/${trip.id}`} className="block">
        <div className="flex items-start justify-between mb-4 pr-12">
          {/* Tiêu đề */}
          <h3 className="text-xl font-extrabold text-foreground line-clamp-2 hover:text-blue-500 transition-colors">
            {trip.title}
          </h3>
        </div>

        {/* Destination & Status Badge */}
        <div className="flex items-center justify-between mb-4 pt-1">
          <div className="flex items-center text-sm font-semibold text-trip">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            {/* Sử dụng destinationName đã kiểm tra an toàn */}
            <span className="truncate">{destinationName}</span>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold border ${getStatusColor(
              trip.status
            )}`}
          >
            {(trip.status || "UNKNOWN").toUpperCase()}
          </span>
        </div>

        {/* Description (Đơn giản hóa) */}
        <p className="text-muted-foreground text-sm mb-5 line-clamp-2 italic">
          {trip.description || "No description provided."}
        </p>

        {/* Trip Details Grid */}
        <div className="space-y-3 mb-5 border-t border-b border-border py-4">
          {/* Date Range */}
          <DetailItem icon={<Calendar className="text-destination" />}>
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </DetailItem>

          {/* Duration */}
          <DetailItem icon={<Clock className="text-indigo-500" />}>
            {diffDays} days
          </DetailItem>

          {/* Budget */}
          <DetailItem icon={<DollarSign className="text-green-500" />}>
            <span className="font-semibold text-foreground">
              {formatCurrency(trip.spent_amount, trip.currency)}
            </span>
            <span className="text-muted-foreground">
              &nbsp;/ {formatCurrency(trip.total_budget, trip.currency)}
            </span>
          </DetailItem>

          {/* Departure */}
          {trip.departure && (
            <DetailItem icon={<MapPin className="text-red-500" />}>
              <span className="truncate">Departure: {trip.departure}</span>
            </DetailItem>
          )}

          {/* Difficulty */}
          <DetailItem
            icon={
              <Gauge
                className={isDifficult ? "text-red-500" : "text-green-500"}
              />
            }
          >
            Difficulty:
            <span
              className={`font-semibold ml-1 ${
                isDifficult ? "text-red-500" : "text-green-500"
              }`}
            >
              {difficultLevel} / 5
            </span>
          </DetailItem>
        </div>

        {/* Budget Progress Bar */}
        <div className="pt-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-700"
              style={{
                width: `${percentageUsed}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            <span className="font-bold text-foreground">
              {percentageUsed.toFixed(0)}%
            </span>{" "}
            of budget used
          </p>
        </div>
      </Link>
    </div>
  );
};
