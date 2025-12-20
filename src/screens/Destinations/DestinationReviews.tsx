"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import CreateReviewModal from "./CreateReviewModal";

interface Props {
  destinationId: string;
}

interface Review {
  traveller_id: string;
  destination_id: string;
  rating_star: number;
  comment?: string;
  created_at?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function DestinationReviews({ destinationId }: Props) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    if (!destinationId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/assess-destination/destination/${destinationId}`);

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.message || "Fetch reviews failed");
      }

      setReviews(result.data || []);
    } catch (err) {
      console.error("fetchReviews error:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [destinationId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Đánh giá địa điểm</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-trip text-white px-4 py-2 rounded"
        >
          Viết đánh giá
        </button>
      </div>

      {loading ? (
        <p>Đang tải đánh giá...</p>
      ) : reviews.length === 0 ? (
        <p>Chưa có đánh giá nào.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, index) => (
            <div
              key={index}
              className="bg-card p-5 rounded-xl shadow border"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= r.rating_star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString()
                    : ""}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                {r.comment || "Không có bình luận"}
              </p>
            </div>
          ))}
        </div>
      )}

      {open && (
        <CreateReviewModal
          destinationId={destinationId}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            fetchReviews();
          }}
        />
      )}
    </div>
  );
}
