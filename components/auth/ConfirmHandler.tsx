"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ConfirmHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailConfirmed = searchParams.get("emailConfirmed");
    if (emailConfirmed === "true") {
      toast.success("Your email has been successfully confirmed!");
    }
  }, [searchParams]); // Ensure this runs when `searchParams` changes

  return null; // This component doesn't render anything
}