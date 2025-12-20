'use client';

import { Navbar } from "@/components/Layout/Navbar";
import ClassicTemplate from "@/screens/Diaries/ClassicTemplate";
import ModernTemplate from "@/screens/Diaries/ModernTemplate";
import TechTemplate from "@/screens/Diaries/TechTemplate";
import TestTemplate from "@/screens/Diaries/TestTemplate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;


export default function Diary() {
  const { diaryId } = useParams<{ diaryId: string }>();
  const [diary, setDiary] = useState<any | null>(null);


  useEffect(function () {
    getDiary(diaryId);
  }, [])

  async function getDiary(diaryId: string) {
    const res = await fetch(`${API}/diaries/${diaryId}`)

    const result = await res.json();

    setDiary(result.data);
  }

  if (!diaryId) return null;


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {(diary && diary.template == "classic") && (
        <ClassicTemplate diary={diary} />
      )}
      {(diary && diary.template == "modern") && (
        <ModernTemplate diary={diary} />
      )}
      {(diary && diary.template == "tech") && (
        <TechTemplate diary={diary} />
      )}
    </div>
  )
}