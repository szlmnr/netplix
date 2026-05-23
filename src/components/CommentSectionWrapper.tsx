// components/CommentSectionWrapper.tsx
"use client";
import { useRouter } from "next/navigation";
import CommentSection from "./CommentSection";

export default function CommentSectionWrapper({ 
  contentId, 
  isLoggedIn 
}: { 
  contentId: string; 
  isLoggedIn: boolean 
}) {
  const router = useRouter();
  
  return (
    <CommentSection
      contentId={contentId}
      isLoggedIn={isLoggedIn}
      onAuthRequired={() => router.push("/login")}
    />
  );
}