import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReservationsClient from "./ReservationsClient";

export default async function ReservationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  return <ReservationsClient />;
}
