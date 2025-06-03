import Header from "@/components/Header";

import LogoutButton from "@/components/auth/LogoutButton"; 
import ConfirmHandler from "@/components/auth/ConfirmHandler"; 
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAllReservations } from "@/lib/actions";
import { useEffect } from "react";

/* IF NOT ADMIN, THEN LOG IN OR SIGNUP */

export default async function page() {
  const [reservations, setReservations] = useState([]);

  const supabase = await createClient();

  // Verify user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  useEffect(() => {
    first
  
    return () => {
      second
    }
  }, [third])
  

  return (
    <main className="w-full rounded-3xl m-2 bg-background">
      <ConfirmHandler />
      <Header title="Rezervacijos" />
      <div className="flex flex-col gap-4 p-4">
        <p>CALENDAR CAROUSEL</p>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-black" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        <LogoutButton />
      </div>
    </main>
  );
}
