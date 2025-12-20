// "use client";

// import { useState } from "react";
// import { X, Star } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { IAssessDestination } from "@/lib/type/interface";

// interface Props {
//   destinationId: string;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function CreateReviewModal({
//   destinationId,
//   onClose,
//   onSuccess,
// }: Props) {
//   const { user } = useAuth();
//   const [rating, setRating] = useState(5);
//   const [comment, setComment] = useState("");
//   const [loading, setLoading] = useState(false);

//   const submitReview = async () => {
//     if (!user?.id) {
//       alert("Bạn cần đăng nhập");
//       return;
//     }

//     setLoading(true);

//     const payload: IAssessDestination = {
//       traveller_id: user.id,
//       destination_id: destinationId,
//       rating_star: rating,
//       comment,
//     };

//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/assess-destination`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       const result = await res.json();

//       if (!res.ok || result.error) {
//         throw new Error(result.message || "Gửi đánh giá thất bại");
//       }

//       setComment("");
//       setRating(5);
//       onSuccess();
//     } catch (err: any) {
//       alert(err.message || "Có lỗi xảy ra");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-card p-6 rounded-xl w-full max-w-md relative">
//         <button onClick={onClose} className="absolute top-3 right-3">
//           <X />
//         </button>

//         <h2 className="text-xl font-bold mb-4">Đánh giá địa điểm</h2>

//         <div className="flex gap-1 mb-4">
//           {[1, 2, 3, 4, 5].map((i) => (
//             <Star
//               key={i}
//               onClick={() => setRating(i)}
//               className={`cursor-pointer w-6 h-6 ${
//                 i <= rating
//                   ? "fill-yellow-400 text-yellow-400"
//                   : "text-gray-300"
//               }`}
//             />
//           ))}
//         </div>

//         <textarea
//           className="w-full border rounded p-2 mb-4"
//           rows={3}
//           placeholder="Chia sẻ cảm nhận của bạn..."
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//         />

//         <button
//           disabled={loading}
//           onClick={submitReview}
//           className="w-full bg-trip text-white py-2 rounded disabled:opacity-50"
//         >
//           {loading ? "Đang gửi..." : "Gửi đánh giá"}
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  destinationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function CreateReviewModal({
  destinationId,
  onClose,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!user?.id) {
      alert("Bạn cần đăng nhập");
      return;
    }

    setLoading(true);

    try {
      // console.log("desid", destinationId);

      const res = await fetch(`${API_URL}/api/assess-destination`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          traveller_id: user.id,
          destination_id: destinationId,
          rating_star: rating,
          comment,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.message || "Gửi đánh giá thất bại");
      }

      onSuccess();
    } catch (err: any) {
      console.error("submitReview error:", err);
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">Đánh giá địa điểm</h2>

        {/* ⭐ Rating */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              onClick={() => setRating(i)}
              className={`cursor-pointer w-6 h-6 ${
                i <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Comment */}
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={3}
          placeholder="Chia sẻ cảm nhận của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={submitReview}
          className="w-full bg-trip text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
}
