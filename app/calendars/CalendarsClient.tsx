"use client";

import Header from "@/components/Header";
import LogoutButton from "@/components/auth/LogoutButton";
import ConfirmHandler from "@/components/auth/ConfirmHandler";
import CalendarList from "@/components/CalendarList";

export default function CalendarsClient() {
  return (
    <main className="w-full rounded-3xl m-2 bg-background">
      <ConfirmHandler />
      <Header title="Kalendoriu nustatymai" />
      <div className="flex flex-col gap-4 p-4">
        <CalendarList />
        <LogoutButton />
      </div>
    </main>
  );
} 