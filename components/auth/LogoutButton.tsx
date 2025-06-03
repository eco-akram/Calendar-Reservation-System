"use client";

import { logout } from "@/lib/actions";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await logout();
      toast.success("You have been logged out successfully!");
      // Ne refreshajet, nado delat hard refresh
      window.location.href = pathname;
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  }

  return (
    <button onClick={handleLogout}>
      <LogOut color="gray" size={15} className="hover:cursor-pointer ml-2" />
    </button>
  );
}
