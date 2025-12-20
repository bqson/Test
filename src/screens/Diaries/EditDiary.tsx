"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { uploadFile } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditDiary({ diaryId }: { diaryId?: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const params = useParams();
    const id = diaryId || (Array.isArray(params?.diaryId) ? params?.diaryId[0] : params?.diaryId);

    const [loading, setLoading] = useState(true);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [previewImages, setPreviewImages] = useState<any[] | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [template, setTemplate] = useState("classic");
    const [feelingDes, setFeelingDes] = useState("");
    const [weatherDes, setWeatherDes] = useState("");
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

    useEffect(() => {
        async function load() {
            try {
                if (!id) return;
                const res = await fetch(`${API}/diaries/${id}`);
                const json = await res.json();

                console.log(json);
                const d = json.data;
                setTitle(d.title || "");
                setDescription(d.description || "");
                setExistingImages(d.img_url || []);
                setIsPublic(Boolean(d.is_public));
                setTemplate(d.template || "classic");
                setFeelingDes(d.feeling_des || "");
                setWeatherDes(d.weather_des || "");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [diaryId]);

    function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        const selectedImages: any[] = [];
        Array.from(files).forEach((file) => {
            selectedImages.push({ file, url: URL.createObjectURL(file) });
        });

        setPreviewImages(selectedImages);
    }

    function removeExistingImage(idx: number) {
        setExistingImages((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // Inline validation
        const newErrors: { title?: string; description?: string } = {};
        if (!title || title.trim().length === 0) newErrors.title = 'Title is required';
        if (!description || description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        try {
            let uploaded: string[] = [];
            if (previewImages && previewImages.length > 0) {
                uploaded = await Promise.all(
                    previewImages.map((item, index) =>
                        uploadFile(item.file, `diaries/images/${Date.now()}-${index}-${item.file.name}`)
                    )
                );
            }

            const payload = {
                title,
                description,
                is_public: isPublic,
                template,
                feeling_des: feelingDes,
                weather_des: weatherDes,
                img_url: [...existingImages, ...uploaded],
            };

            console.log(payload);

            const res = await fetch(`${API}/diaries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Update failed");

            router.push(`/diaries/${id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to update diary");
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Journal Entry</h1>
                    <p className="text-sm text-gray-500 mt-1">Update your travel entry</p>
                </div>

                <Link href="/diaries" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                    ← Back
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white border rounded-xl p-6 mb-6">
                    <h2 className="font-semibold mb-1">Choose a Journal Template</h2>
                    <p className="text-sm text-gray-500 mb-4">Start with a template to help you write faster</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`text-left border rounded-xl p-4 hover:border-green-500 hover:bg-green-50 transition ${template === 'classic' ? 'ring-2 ring-green-200' : ''}`}>
                            <input
                                type="radio"
                                value="classic"
                                name="template"
                                className="mt-1 accent-green-600"
                                checked={template === 'classic'}
                                onChange={() => setTemplate('classic')}
                            />

                            <h3 className="mt-2 font-semibold text-gray-900 flex items-center gap-2">✈️ Classic Diary</h3>
                            <p className="text-sm text-gray-600 mt-1">Nhật ký truyền thống theo dòng thời gian</p>
                        </label>

                        <label className={`text-left border rounded-xl p-4 hover:border-green-500 hover:bg-green-50 transition ${template === 'modern' ? 'ring-2 ring-green-200' : ''}`}>
                            <input
                                type="radio"
                                value="modern"
                                name="template"
                                className="mt-1 accent-green-600"
                                checked={template === 'modern'}
                                onChange={() => setTemplate('modern')}
                            />

                            <h3 className="mt-2 font-semibold text-gray-900 flex items-center gap-2">🌤 Modern Reflection</h3>
                            <p className="text-sm text-gray-600 mt-1">Nhật ký cảm xúc & suy nghĩ mỗi ngày</p>
                        </label>

                        <label className={`text-left border rounded-xl p-4 hover:border-green-500 hover:bg-green-50 transition ${template === 'tech' ? 'ring-2 ring-green-200' : ''}`}>
                            <input
                                type="radio"
                                value="tech"
                                name="template"
                                className="mt-1 accent-green-600"
                                checked={template === 'tech'}
                                onChange={() => setTemplate('tech')}
                            />

                            <h3 className="mt-2 font-semibold text-gray-900 flex items-center gap-2">⚡ Tech Log</h3>
                            <p className="text-sm text-gray-600 mt-1">Ghi chép theo dạng module & dữ liệu</p>
                        </label>
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-6 mb-6">
                    <h2 className="font-semibold mb-1">Entry Title</h2>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" name="title" placeholder="Title" className={`w-full px-4 py-2 border rounded-lg ${errors.title ? 'border-red-500' : ''}`} />
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div className="bg-white border rounded-xl p-6 mb-6">
                    <h2 className="font-semibold mb-2">Write your experience</h2>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={`w-full px-4 py-3 border rounded-lg ${errors.description ? 'border-red-500' : ''}`} />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="bg-white border rounded-xl p-6 mb-6">
                    <h2 className="font-semibold mb-4">Media</h2>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {existingImages.map((src, idx) => (
                            <div key={idx} className="relative group border rounded-xl overflow-hidden">
                                <img src={src} className="h-32 w-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-2 right-2 bg-white text-gray-700 text-xs w-7 h-7 flex items-center justify-center rounded-full shadow hover:bg-red-500 hover:text-white">✕</button>
                            </div>
                        ))}
                    </div>

                    <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-sm text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition min-h-[140px]">
                        <span className="text-2xl mb-1">📷</span>
                        <span className="font-medium">Upload Photos</span>
                        <input type="file" accept="image/png, image/jpeg" className="hidden" multiple onChange={handlePhotosChange} />
                    </label>
                </div>

                <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
                    <Link href={`/diaries/${id}`} className="px-4 py-2 border rounded-lg">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
