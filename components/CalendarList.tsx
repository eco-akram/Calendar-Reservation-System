"use client";
import React from "react";

import { useEffect, useState } from "react";
import { getCalendars, type CalendarWithSettings } from "@/lib/actions";
import Link from "next/link";

export default function CalendarList() {
  const [calendars, setCalendars] = useState<CalendarWithSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendars() {
      try {
        const data = await getCalendars();
        setCalendars(data);

        console.log("Fetched calendars:", data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch calendars"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCalendars();
  }, []);

  if (loading) {
    return <div className="p-4">Loading calendars...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4" >
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Available Calendars</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {calendars.map((calendar) => (
            <Link href={`/calendar/${calendar.id}`} key={calendar.id}>
              <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-xl font-semibold mb-2">{calendar.name}</h3>
                {calendar.description && (
                  <p className="text-gray-600 mb-2">{calendar.description}</p>
                )}
                {calendar.settings && calendar.settings.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {calendar.settings.map((setting, index) => (
                      <div key={index} className="mb-2">
                        <p>Slot duration: {setting.slot_duration_minutes} minutes</p>
                        <p>
                          Multiple bookings:{" "}
                          {setting.allow_multiple_bookings ? "Allowed" : "Not allowed"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

