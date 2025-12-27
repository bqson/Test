// RouteCard.tsx

import React, { useState } from "react";
import {
  Route,
  Navigation,
  PlusCircle,
  DollarSign,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { ICost, IRoute } from "@/lib/type/interface";

// Hàm tiện ích formatCurrency
const formatCurrencyLocal = (amount: number) => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
};

// --- AddCostForm Component ---
interface AddCostFormProps {
  onClose: () => void;
  onSubmit: (
    newCost: Omit<ICost, "id" | "created_at" | "updated_at" | "route_id">
  ) => void;
}

const AddCostForm: React.FC<AddCostFormProps> = ({ onClose, onSubmit }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;
    onSubmit({
      description,
      amount,
      currency: "VND",
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-100 mt-2">
      <h4 className="text-sm font-bold mb-2 text-trip">Thêm Chi Phí</h4>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả (vd: Tiền vé, Ăn tối)"
          required
          className="w-full rounded-md border p-1.5 text-xs"
        />
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            min="0"
            placeholder="Số tiền (VND)"
            className="w-full rounded-md border p-1.5 text-xs"
          />
          <button
            type="submit"
            className="flex items-center text-xs px-2 py-1 bg-trip text-white rounded-full hover:bg-trip-dark transition-colors"
            disabled={!description || amount <= 0}
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center text-xs px-2 py-1 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
};

// --- RouteCard Component Chính ---
interface RouteCardProps {
  route: IRoute;
  onAddCost: (
    routeId: string,
    newCost: Omit<ICost, "id" | "created_at" | "updated_at" | "route_id">
  ) => void;
  onDeleteCost: (routeId: string, costId: string) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  onAddCost,
  onDeleteCost,
}) => {
  const [isAddingCost, setIsAddingCost] = useState(false);
  const totalRouteCost = route.costs.reduce(
    (sum, cost) => sum + cost.amount,
    0
  );

  const handleAddCostSubmit = (
    newCost: Omit<ICost, "id" | "created_at" | "updated_at" | "route_id">
  ) => {
    if (route.id) {
      onAddCost(route.id, newCost);
    }
    setIsAddingCost(false);
  };

  return (
    <div className="bg-card p-5 rounded-xl shadow-md border border-border transition-shadow hover:shadow-lg">
      {/* Header và Title */}
      <div className="flex justify-between items-start mb-2 border-b pb-2 border-dashed">
        <h3 className="text-xl font-bold text-foreground">
          <Route className="inline w-5 h-5 mr-2 text-traveller" />
          {route.title}
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-trip/10 text-trip">
          Stop {(route.index ?? 0) + 1}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{route.description}</p>

      {/* Tọa độ */}
      <div className="text-sm text-muted-foreground mb-3 p-3 bg-muted rounded-md border border-border">
        <h4 className="font-semibold text-foreground mb-1 flex items-center">
          <Navigation className="w-4 h-4 mr-1" /> Tọa độ:
        </h4>
        <p>
          Bắt đầu: Lat: {route.latStart}, Lng: {route.lngStart}
        </p>
        <p>
          Kết thúc: Lat: {route.latEnd}, Lng: {route.lngEnd}
        </p>
      </div>

      {/* Hoạt động */}
      <h4 className="font-semibold text-sm text-foreground/80 mb-1">
        Hoạt động:
      </h4>
      <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 ml-4 mb-4">
        {route.details.map((detail: string, i: number) => (
          <li key={i}>{detail}</li>
        ))}
      </ul>

      {/* Chi phí (Cost Management) */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-base text-foreground flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-red-500" /> Tổng Chi phí
            Chặng:{" "}
            <span className="ml-2 text-red-600">
              {formatCurrencyLocal(totalRouteCost)}
            </span>
          </h4>
          <button
            onClick={() => setIsAddingCost(!isAddingCost)}
            className="flex items-center text-xs text-red-500 hover:text-red-700 transition-colors font-medium border border-red-500 rounded-full px-2 py-1"
          >
            <PlusCircle className="w-3 h-3 mr-1" />{" "}
            {isAddingCost ? "Đóng" : "Thêm Cost"}
          </button>
        </div>

        {isAddingCost && (
          <div className="mb-4">
            <AddCostForm
              onClose={() => setIsAddingCost(false)}
              onSubmit={handleAddCostSubmit}
            />
          </div>
        )}

        {/* Danh sách Cost */}
        <div className="space-y-2">
          {route.costs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic p-2 bg-gray-50 rounded-md">
              Chưa có chi phí nào được ghi nhận cho chặng này.
            </p>
          ) : (
            <div className="text-xs border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 font-semibold bg-gray-100 p-2 text-foreground/80 border-b">
                <span className="col-span-2">Mô tả</span>
                <span className="text-right">Số tiền</span>
                <span className="text-center">Xóa</span>
              </div>
              {route.costs.map((cost) => (
                <div
                  key={cost.id}
                  className="grid grid-cols-4 items-center p-2 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <span className="col-span-2 truncate">
                    {cost.description}
                  </span>
                  <span className="text-right font-medium text-destructive">
                    {formatCurrencyLocal(cost.amount)}
                  </span>
                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        cost.id && route.id && onDeleteCost(route.id, cost.id)
                      }
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label={`Xóa chi phí ${cost.description}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
