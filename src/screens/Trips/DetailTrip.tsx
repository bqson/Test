// DetailTrip.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Activity,
  ArrowLeft,
  PlusCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AddRouteForm } from "./AddRouteForm";
import { ICost, IRoute, TripDetail } from "@/lib/type/interface";
import { RouteCard } from "@/components/Route/RouteCard";

// Hàm tính toán tổng chi tiêu của chuyến đi
const calculateSpentAmount = (routes: IRoute[]): number => {
  if (!routes || routes.length === 0) return 0;

  return routes.reduce((sumRoute, route) => {
    if (!route.costs || route.costs.length === 0) return sumRoute;

    const routeCost = route.costs.reduce(
      (sumCost, cost) => sumCost + (cost.amount || 0),
      0
    );
    return sumRoute + routeCost;
  }, 0);
};

// Hàm tiện ích formatCurrency với xử lý null/undefined
const formatCurrency = (amount: number | null | undefined) => {
  const value = amount || 0;
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
};

interface DetailTripProps {
  params: {
    id: string;
  };
}

// Component chính
export const DetailTrip: React.FC<DetailTripProps> = ({ params }) => {
  const router = useRouter();
  const tripId = params.id;

  const isValidId = tripId && typeof tripId === "string" && tripId.length > 0;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(isValidId);
  const [error, setError] = useState<string | null>(null);
  const [isAddingRoute, setIsAddingRoute] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch trip detail từ API
  useEffect(() => {
    const fetchTripDetail = async () => {
      if (!isValidId || !API_URL) {
        setLoading(false);
        setTrip(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/trips/${tripId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch trip (Status: ${response.status})`);
        }

        const result = await response.json();
        let tripData: TripDetail = result.data || result;

        // Đảm bảo các giá trị số không null/undefined
        tripData = {
          ...tripData,
          total_budget: tripData.total_budget || 0,
          spent_amount: tripData.spent_amount || 0,
          distance: tripData.distance || 0,
          difficult: tripData.difficult || 1,
        };

        // Đảm bảo routes và costs được khởi tạo
        if (!tripData.routes) {
          tripData.routes = [];
        } else {
          // Đảm bảo mỗi route có mảng costs
          tripData.routes = tripData.routes.map((route) => ({
            ...route,
            costs: route.costs || [],
          }));
        }

        // Tính toán spent_amount từ costs
        const calculatedSpent = calculateSpentAmount(tripData.routes);
        tripData.spent_amount = calculatedSpent;

        console.log("Trip data loaded:", tripData); // Debug log

        setTrip(tripData);
      } catch (err) {
        console.error("Error fetching trip detail:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load trip details"
        );
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetail();
  }, [tripId, isValidId, API_URL]);

  // Hàm xử lý khi thêm Route mới
  const handleAddNewRoute = async (
    newRoute: Omit<
      IRoute,
      "id" | "created_at" | "updated_at" | "trip_id" | "costs"
    >
  ) => {
    if (!trip || !API_URL) return;

    try {
      const routePayload = {
        ...newRoute,
        trip_id: trip.id,
      };

      const response = await fetch(`${API_URL}/routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create route");
      }

      const result = await response.json();
      const createdRoute: IRoute = result.data || result;

      // Đảm bảo route có mảng costs
      if (!createdRoute.costs) {
        createdRoute.costs = [];
      }

      const updatedRoutes = [...trip.routes, createdRoute];

      setTrip({
        ...trip,
        routes: updatedRoutes,
        spent_amount: calculateSpentAmount(updatedRoutes),
      });

      setIsAddingRoute(false);
    } catch (err) {
      console.error("Error creating route:", err);
      alert(
        `Failed to create route: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  // --- HÀM QUẢN LÝ CHI PHÍ ---

  // 1. Thêm Cost
  const handleAddCost = async (
    routeId: string,
    newCost: Omit<ICost, "id" | "created_at" | "updated_at" | "route_id">
  ) => {
    if (!trip || !API_URL) return;

    try {
      const costPayload = {
        ...newCost,
        route_id: routeId,
      };

      const response = await fetch(`${API_URL}/costs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(costPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create cost");
      }

      const result = await response.json();
      const createdCost: ICost = result.data || result;

      const updatedRoutes = trip.routes.map((route) => {
        if (route.id === routeId) {
          return {
            ...route,
            costs: [...route.costs, createdCost],
          };
        }
        return route;
      });

      setTrip({
        ...trip,
        routes: updatedRoutes,
        spent_amount: calculateSpentAmount(updatedRoutes),
      });
    } catch (err) {
      console.error("Error creating cost:", err);
      alert(
        `Failed to add cost: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  // 2. Xóa Cost
  const handleDeleteCost = async (routeId: string, costId: string) => {
    if (!trip || !API_URL) return;

    if (!confirm("Are you sure you want to delete this cost?")) return;

    try {
      const response = await fetch(`${API_URL}/costs/${costId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete cost");
      }

      const updatedRoutes = trip.routes.map((route) => {
        if (route.id === routeId) {
          return {
            ...route,
            costs: route.costs.filter((cost) => cost.id !== costId),
          };
        }
        return route;
      });

      setTrip({
        ...trip,
        routes: updatedRoutes,
        spent_amount: calculateSpentAmount(updatedRoutes),
      });
    } catch (err) {
      console.error("Error deleting cost:", err);
      alert(
        `Failed to delete cost: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  // Hàm lấy màu status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-700";
      case "ongoing":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trip"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-destructive mb-4">
          Error Loading Trip
        </h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => router.push("/trips")}
          className="text-trip hover:underline flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chuyến đi
        </button>
      </div>
    );
  }

  // Trip not found
  if (!trip) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-destructive">
          Chuyến đi không tồn tại hoặc ID không hợp lệ
        </h1>
        <button
          onClick={() => router.push("/trips")}
          className="mt-4 text-trip hover:underline flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chuyến đi
        </button>
      </div>
    );
  }

  // Tính toán budget usage với xử lý an toàn
  const totalBudget = trip.total_budget || 0;
  const spentAmount = trip.spent_amount || 0;
  const budgetUsage =
    totalBudget > 0 ? Math.min((spentAmount / totalBudget) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Component Thêm Route (Dạng Modal/Side Panel) */}
      {isAddingRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
          <AddRouteForm
            onClose={() => setIsAddingRoute(false)}
            onSubmit={handleAddNewRoute}
            currentMaxIndex={
              trip.routes.length > 0
                ? Math.max(...trip.routes.map((r) => r.index))
                : 0
            }
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header và Title */}
        <div className="mb-8 border-b pb-4 border-border">
          <button
            onClick={() => router.push("/trips")}
            className="text-muted-foreground hover:text-trip flex items-center mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-extrabold text-foreground">
              {trip.title || "Untitled Trip"}
            </h1>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                trip.status
              )}`}
            >
              {(trip.status || "planning").toUpperCase()}
            </span>
          </div>
          {trip.description && (
            <p className="text-lg text-muted-foreground mt-2">
              {trip.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột Trái: Thông tin tổng quan và Ngân sách */}
          <div className="lg:col-span-1 space-y-8">
            {/* Box Thông tin cơ bản */}
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <h2 className="text-xl font-bold mb-4 text-trip flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> Thông tin cơ bản
              </h2>
              <div className="space-y-3 text-sm">
                <p className="flex justify-between items-center text-foreground">
                  Địa điểm:{" "}
                  <span>
                    {trip.destination?.name || trip.destination || "N/A"}
                  </span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Khởi hành: <span>{trip.departure || "N/A"}</span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Ngày đi:{" "}
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />{" "}
                    {trip.start_date
                      ? new Date(trip.start_date).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Ngày về:{" "}
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />{" "}
                    {trip.end_date
                      ? new Date(trip.end_date).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Thành viên:{" "}
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" /> {trip.members || "N/A"}
                  </span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Mức độ khó:{" "}
                  <span className="font-semibold text-traveller">
                    {trip.difficult || 1}/5
                  </span>
                </p>
                {trip.distance && trip.distance > 0 && (
                  <p className="flex justify-between items-center text-foreground">
                    Khoảng cách: <span>{trip.distance} km</span>
                  </p>
                )}
              </div>
            </div>

            {/* Box Ngân sách và Chi tiêu */}
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <h2 className="text-xl font-bold mb-4 text-trip flex items-center">
                <DollarSign className="w-5 h-5 mr-2" /> Ngân sách & Chi tiêu
              </h2>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="flex justify-between font-medium text-foreground">
                    Ngân sách tổng: <span>{formatCurrency(totalBudget)}</span>
                  </p>
                  <p className="flex justify-between font-medium text-destructive">
                    Đã chi tiêu: <span>{formatCurrency(spentAmount)}</span>
                  </p>
                  <p className="flex justify-between text-muted-foreground mt-2 border-t pt-2 border-border">
                    Còn lại:{" "}
                    <span
                      className={
                        totalBudget - spentAmount < 0
                          ? "text-red-600 font-semibold"
                          : ""
                      }
                    >
                      {formatCurrency(totalBudget - spentAmount)}
                    </span>
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm mb-1 text-muted-foreground">
                    Tiến độ chi tiêu: {budgetUsage.toFixed(1)}%
                  </p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`rounded-full h-3 transition-all ${
                        budgetUsage > 100 ? "bg-destructive" : "bg-trip"
                      }`}
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                    ></div>
                  </div>
                  {totalBudget - spentAmount < 0 && (
                    <p className="text-xs text-destructive mt-1">
                      Đã vượt ngân sách!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cột Phải: Lịch trình chi tiết */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Activity className="w-6 h-6 mr-2 text-traveller" /> Danh sách
                Chặng đường
              </h2>
              <button
                onClick={() => setIsAddingRoute(true)}
                className="flex items-center text-trip hover:text-trip-dark transition-colors font-medium text-sm border border-trip rounded-full px-3 py-1"
              >
                <PlusCircle className="w-4 h-4 mr-1" /> Thêm Chặng
              </button>
            </div>

            <div className="space-y-4">
              {trip.routes && trip.routes.length > 0 ? (
                trip.routes
                  .sort((a, b) => a.index - b.index)
                  .map((route: IRoute) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      onAddCost={handleAddCost}
                      onDeleteCost={handleDeleteCost}
                    />
                  ))
              ) : (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Chưa có chặng đường nào. Hãy thêm chặng đầu tiên!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTrip;
