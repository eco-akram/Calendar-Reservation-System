"use client";

import { logout } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    try {
      await logout();
      toast.success("You have been logged out successfully!"); // Show success toast
      router.push("/admin/auth/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again."); // Show error toast
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
    >
      Log out
    </button>
  );
}