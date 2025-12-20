import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;


export default function Diaries() {
  const [diaries, setDiaries] = useState<any[] | null>(null);
  const [allDiaries, setAllDiaries] = useState<any[] | null>(null);
  const [filter, setFilter] = useState<string>("my-entries");
  const { user } = useAuth();

  useEffect(function () {
    getDiaries();
  }, []);

  useEffect(function () {
    if (!allDiaries) return;
    let filterList: any[] = allDiaries;

    if (filter === "my-entries") {
      filterList = allDiaries.filter(function (diary: any) {
        return diary.user_id === user?.id;
      });
    } else if (filter === "drafts") {
      filterList = allDiaries.filter(function (diary: any) {
        return diary.is_public === false;
      });
    } else if (filter === "explore") {
      filterList = allDiaries.filter(function (diary: any) {
        return diary.user_id !== user?.id;
      });
    }

    setDiaries(filterList);
  }, [filter, allDiaries, user]);

  async function getDiaries() {
    const res = await fetch(`${API}/diaries`);
    const result = await res.json();
    setAllDiaries(result.data || []);
    setDiaries(result.data || []);
  }

  async function handleDelete(id: any) {
    const ok = window.confirm('Are you sure you want to delete this diary?');
    if (!ok) return;

    try {
      const res = await fetch(`${API}/diaries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      // remove from local state
      setAllDiaries((prev) => prev ? prev.filter((d: any) => d.id !== id) : prev);
      setDiaries((prev) => prev ? prev.filter((d: any) => d.id !== id) : prev);
    } catch (error) {
      console.error('Delete diary error', error);
      alert('Failed to delete diary');
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Travel Diary</h1>
              <p className="text-sm text-gray-500 mt-1">
                Capture and share your adventure memories
              </p>
            </div>
            <Link href="/diaries/create" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">
              + New Entry
            </Link>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full border text-sm cursor-pointer" onClick={() => setFilter("my-entries")}>My entries</button>
              <button className="px-4 py-1.5 rounded-full border text-sm cursor-pointer" onClick={() => setFilter("drafts")}>Drafts</button>
              <button className="px-4 py-1.5 rounded-full border text-sm cursor-pointer" onClick={() => setFilter("explore")}>Explore</button>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Search entries..." className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button className="px-4 py-2 border rounded-lg text-sm bg-white">
                Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CARD */}
            {diaries && diaries.map(function (diary: any) {
              return (
                <div key={diary.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
                  <Link href={`/diaries/${diary.id}`} className="block">
                    {diary.img_url && diary.img_url.length > 0 ? (
                      <img src={diary.img_url[0]} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gray-200" />
                    )}
                  </Link>

                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        {diary.is_public && (
                          <span className="inline-block text-xs font-semibold bg-green-100 text-green-600 px-2 py-0.5 rounded-full mb-2">
                            Public
                          </span>
                        )}
                        <h3 className="font-bold text-lg">{diary.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Dec 15, 2025 - Dec 22, 2025
                        </p>
                      </div>

                      {/* Edit/Delete buttons for owner's diaries */}
                      {diary.user_id === user?.id && (
                        <div className="flex items-center gap-2">
                          <Link href={`/diaries/${diary.id}/edit`} className="text-sm px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(diary.id)} className="text-sm px-3 py-1 border rounded-md text-red-600 hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {diary.description}
                    </p>
                  </div>
                </div>
              )
            })}

          </div>



        </div>
      </div>
    </>
  )
}