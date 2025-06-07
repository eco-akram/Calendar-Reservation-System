"use client";

import Header from "@/components/Header";
import ConfirmHandler from "@/components/auth/ConfirmHandler";
import { getAllReservations, type Reservations } from "@/lib/actions";
import { useEffect, useState } from "react";
import { ReservationsTable } from "@/components/ReservationsTable";

export default function ReservationsClient() {
  const [reservations, setReservations] = useState<Reservations[]>([]);

  useEffect(() => {
    async function fetchReservations() {
      const data = await getAllReservations();
      setReservations(data);
    }
    fetchReservations();
  }, []);

  return (
    <main className="w-full rounded-3xl m-2 bg-background">
      <ConfirmHandler />
      <Header title="Rezervacijos" />
      <div className="flex flex-col gap-4 p-4">
        <ReservationsTable data={reservations} />
      </div>
    </main>
  );
}
