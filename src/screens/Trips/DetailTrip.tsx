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
import { AddRouteForm } from "./AddRouteForm"; // Import AddRouteForm
import { ICost, IRoute, TripDetail } from "@/lib/type/interface";
import { RouteCard } from "@/components/Route/RouteCard";

// --- MOCK DATA VÀ UTILS ---
const mockDate = new Date();

// Hàm giả lập tính toán lại tổng chi tiêu của chuyến đi
const calculateSpentAmount = (routes: IRoute[]): number => {
  return routes.reduce((sumRoute, route) => {
    const routeCost = route.costs.reduce(
      (sumCost, cost) => sumCost + cost.amount,
      0
    );
    return sumRoute + routeCost;
  }, 0);
};

// Hàm tiện ích formatCurrency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
};

// Dữ liệu Mock đã cập nhật để bao gồm costs
const MOCK_DETAIL_TRIPS: TripDetail[] = [
  {
    id: "mock_trip_1",
    title: "Khám phá Vịnh Hạ Long",
    description:
      "Chuyến đi 3 ngày 2 đêm khám phá kỳ quan thiên nhiên thế giới, bao gồm chèo thuyền kayak và ngủ đêm trên du thuyền.",
    departure: "Hà Nội",
    destination: "Vịnh Hạ Long",
    start_date: "2025-01-15",
    end_date: "2025-01-17",
    difficult: 2,
    total_budget: 15000000,
    spent_amount: 4500000, // Sẽ được tính lại bằng calculateSpentAmount
    status: "ongoing",
    currency: "VND",
    members: 4,
    routes: [
      {
        id: "r1_1",
        index: 1,
        trip_id: "mock_trip_1",
        title: "Hà Nội - Du thuyền Hạ Long",
        description: "Di chuyển từ thủ đô ra Hạ Long và lên du thuyền.",
        lngStart: 105.854,
        latStart: 21.028,
        lngEnd: 107.031,
        latEnd: 20.912,
        details: [
          "Di chuyển từ Hà Nội",
          "Nhận phòng du thuyền",
          "Ăn trưa & thăm quan Hang Sửng Sốt",
        ],
        costs: [
          {
            id: "c1_1_1",
            route_id: "r1_1",
            description: "Xe bus Hà Nội - Hạ Long",
            amount: 500000,
            currency: "VND",
            created_at: mockDate,
            updated_at: mockDate,
          },
          {
            id: "c1_1_2",
            route_id: "r1_1",
            description: "Phí Du thuyền/Ăn trưa (Ngày 1)",
            amount: 4000000,
            currency: "VND",
            created_at: mockDate,
            updated_at: mockDate,
          },
        ],
        created_at: mockDate,
        updated_at: mockDate,
      },
      {
        id: "r1_2",
        index: 2,
        trip_id: "mock_trip_1",
        title: "Khám phá Lan Hạ và Kayak",
        description: "Hoạt động chính trong ngày là chèo kayak và học nấu ăn.",
        lngStart: 107.031,
        latStart: 20.912,
        lngEnd: 107.025,
        latEnd: 20.8,
        details: [
          "Ngắm bình minh",
          "Chèo thuyền kayak tại Vịnh Lan Hạ",
          "Lớp học nấu ăn Việt Nam",
        ],
        costs: [],
        created_at: mockDate,
        updated_at: mockDate,
      },
      {
        id: "r1_3",
        index: 3,
        trip_id: "mock_trip_1",
        title: "Du thuyền - Trở về Hà Nội",
        description: "Ăn sáng và trở về đất liền, kết thúc chuyến đi.",
        lngStart: 107.025,
        latStart: 20.8,
        lngEnd: 105.854,
        latEnd: 21.028,
        details: ["Ăn sáng cuối cùng", "Trở về Hà Nội"],
        costs: [],
        created_at: mockDate,
        updated_at: mockDate,
      },
    ],
  },
  // THÊM CÁC TRIP KHÁC VÀO ĐÂY (VỚI routes[].costs: [])
];

// Hàm giả lập fetch trip
const fetchTripDetail = (id: string): Promise<TripDetail | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trip = MOCK_DETAIL_TRIPS.find((t) => t.id === id);
      if (trip) {
        // Cập nhật spent_amount dựa trên costs trong mock data
        trip.spent_amount = calculateSpentAmount(trip.routes);
      }
      resolve(trip);
    }, 500);
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
  const [isAddingRoute, setIsAddingRoute] = useState(false);

  useEffect(() => {
    if (isValidId) {
      const loadTrip = async () => {
        const data = await fetchTripDetail(tripId);
        setTrip(data || null);
        setLoading(false);
      };
      loadTrip();
    } else {
      setLoading(false);
      setTrip(null);
    }
  }, [tripId, isValidId]);

  // Hàm xử lý khi thêm Route mới
  const handleAddNewRoute = (
    newRoute: Omit<
      IRoute,
      "id" | "created_at" | "updated_at" | "trip_id" | "costs"
    >
  ) => {
    if (!trip) return;

    const newId = `r${trip.routes.length + 1}_${Date.now()}`;
    const now = new Date();

    const routeWithId: IRoute = {
      ...newRoute,
      id: newId,
      trip_id: trip.id,
      costs: [], // Khởi tạo mảng chi phí rỗng
      created_at: now,
      updated_at: now,
    };

    const updatedRoutes = [...trip.routes, routeWithId];

    setTrip({
      ...trip,
      routes: updatedRoutes,
      spent_amount: calculateSpentAmount(updatedRoutes),
    });

    setIsAddingRoute(false);
  };

  // --- HÀM QUẢN LÝ CHI PHÍ MỚI ---

  // 1. Thêm Cost
  const handleAddCost = (
    routeId: string,
    newCost: Omit<ICost, "id" | "created_at" | "updated_at" | "route_id">
  ) => {
    if (!trip) return;

    const now = new Date();
    const newCostId = `c${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const costWithId: ICost = {
      ...newCost,
      id: newCostId,
      route_id: routeId,
      created_at: now,
      updated_at: now,
    };

    const updatedRoutes = trip.routes.map((route) => {
      if (route.id === routeId) {
        return {
          ...route,
          costs: [...route.costs, costWithId],
        };
      }
      return route;
    });

    setTrip({
      ...trip,
      routes: updatedRoutes,
      spent_amount: calculateSpentAmount(updatedRoutes),
    });
  };

  // 2. Xóa Cost
  const handleDeleteCost = (routeId: string, costId: string) => {
    if (!trip) return;

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
  };

  // Các hàm phụ trợ
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trip"></div>
      </div>
    );
  }

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

  const budgetUsage = Math.min(
    (trip.spent_amount / trip.total_budget) * 100,
    100
  );

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
              {trip.title}
            </h1>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                trip.status
              )}`}
            >
              {trip.status.toUpperCase()}
            </span>
          </div>
          <p className="text-lg text-muted-foreground mt-2">
            {trip.description}
          </p>
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
                  Địa điểm: <span>{trip.destination}</span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Khởi hành: <span>{trip.departure}</span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Ngày đi:{" "}
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />{" "}
                    {new Date(trip.start_date).toLocaleDateString("vi-VN")}
                  </span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Ngày về:{" "}
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />{" "}
                    {new Date(trip.end_date).toLocaleDateString("vi-VN")}
                  </span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Thành viên:{" "}
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" /> {trip.members}
                  </span>
                </p>
                <p className="flex justify-between items-center text-foreground">
                  Mức độ khó:{" "}
                  <span className="font-semibold text-traveller">
                    {trip.difficult}/5
                  </span>
                </p>
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
                    Ngân sách tổng:{" "}
                    <span>{formatCurrency(trip.total_budget)}</span>
                  </p>
                  <p className="flex justify-between font-medium text-destructive">
                    Đã chi tiêu:{" "}
                    <span>{formatCurrency(trip.spent_amount)}</span>
                  </p>
                  <p className="flex justify-between text-muted-foreground mt-2 border-t pt-2 border-border">
                    Còn lại:{" "}
                    <span
                      className={
                        trip.total_budget - trip.spent_amount < 0
                          ? "text-red-600 font-semibold"
                          : ""
                      }
                    >
                      {formatCurrency(trip.total_budget - trip.spent_amount)}
                    </span>
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm mb-1 text-muted-foreground">
                    Tiến độ chi tiêu: {budgetUsage.toFixed(1)}%
                  </p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`rounded-full h-3 ${
                        budgetUsage > 100 ? "bg-destructive" : "bg-trip"
                      }`}
                      style={{ width: `${budgetUsage}%` }}
                    ></div>
                  </div>
                  {trip.total_budget - trip.spent_amount < 0 && (
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
              {trip.routes
                .sort((a, b) => a.index - b.index) // Sắp xếp theo Index
                .map((route: IRoute) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    onAddCost={handleAddCost}
                    onDeleteCost={handleDeleteCost}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTrip;
