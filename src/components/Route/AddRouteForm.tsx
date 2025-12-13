// AddRouteForm.tsx

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { IRoute } from "@/lib/type/interface";

interface AddRouteFormProps {
  onClose: () => void;
  onSubmit: (
    newRoute: Omit<
      IRoute,
      "id" | "created_at" | "updated_at" | "trip_id" | "costs"
    >
  ) => void;
  currentMaxIndex: number;
}

export const AddRouteForm: React.FC<AddRouteFormProps> = ({
  onClose,
  onSubmit,
  currentMaxIndex,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lngStart, setLngStart] = useState(0);
  const [latStart, setLatStart] = useState(0);
  const [lngEnd, setLngEnd] = useState(0);
  const [latEnd, setLatEnd] = useState(0);
  const [detailsInput, setDetailsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const details = detailsInput
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const newRouteData: Omit<
      IRoute,
      "id" | "created_at" | "updated_at" | "trip_id" | "costs"
    > = {
      index: currentMaxIndex + 1,
      title,
      description,
      lngStart,
      latStart,
      lngEnd,
      latEnd,
      details,
    };

    onSubmit(newRouteData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-2xl font-bold text-trip">Thêm Chặng Đường Mới</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Title & Description */}
        <div>
          <label className="block font-medium mb-1">Tên Chặng (*)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Mô tả chi tiết (*)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Tọa độ */}
        <div className="border p-3 rounded-md bg-gray-50">
          <h3 className="font-semibold mb-2">Tọa độ (Giả định)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium">Bắt đầu (Lat)</label>
              <input
                type="number"
                step="0.0001"
                value={latStart}
                onChange={(e) => setLatStart(Number(e.target.value))}
                className="w-full border p-1 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Bắt đầu (Lng)</label>
              <input
                type="number"
                step="0.0001"
                value={lngStart}
                onChange={(e) => setLngStart(Number(e.target.value))}
                className="w-full border p-1 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">
                Kết thúc (Lat)
              </label>
              <input
                type="number"
                step="0.0001"
                value={latEnd}
                onChange={(e) => setLatEnd(Number(e.target.value))}
                className="w-full border p-1 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">
                Kết thúc (Lng)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lngEnd}
                onChange={(e) => setLngEnd(Number(e.target.value))}
                className="w-full border p-1 rounded-md text-xs"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <label className="block font-medium mb-1">
            Hoạt động (Ngăn cách bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={detailsInput}
            onChange={(e) => setDetailsInput(e.target.value)}
            placeholder="Ví dụ: Ăn sáng, Tắm biển, Check-in"
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center text-sm px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 mr-1" /> Hủy
          </button>
          <button
            type="submit"
            className="flex items-center text-sm px-4 py-2 bg-trip text-white rounded-full hover:bg-trip-dark transition-colors"
          >
            <Check className="w-4 h-4 mr-1" /> Thêm Chặng
          </button>
        </div>
      </form>
    </div>
  );
};
