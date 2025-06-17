import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CalendarsClient from "./CalendarsClient";

export default async function CalendarsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  return <CalendarsClient />;
}
