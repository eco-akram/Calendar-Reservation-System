"use client";
import React from "react";

import { useEffect, useState } from "react";
import {
  getCalendars,
  type CalendarWithSettings,
  getWorkingHoursById,
} from "@/lib/actions";
import Link from "next/link";
import { Calendar, CalendarPlus, Clock } from "lucide-react";

interface CalendarsWithWorkHours extends CalendarWithSettings {
  workHours: {
    id: string;
    calendar_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[];
}

export default function CalendarList() {
  const [calendars, setCalendars] = useState<CalendarWithSettings[]>([]);
  const [calendarsWithWorkHours, setCalendarsWithWorkHours] = useState<
    CalendarsWithWorkHours[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendars() {
      try {
        const data = await getCalendars();
        setCalendars(data);

        const calendarsWithWorkHours = await Promise.all(
          data.map(async (calendar) => {
            const workHours = await getWorkingHoursById(calendar.id);
            return { ...calendar, workHours };
          })
        );

        setCalendarsWithWorkHours(calendarsWithWorkHours);

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

  const dayMap = [
    "Sekmadienis",
    "Pirmadienis",
    "Antradienis",
    "Trečiadienis",
    "Ketvirtadienis",
    "Penktadienis",
    "Šeštadienis",
  ];

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Kraunami kalendoriai...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Klaida: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendars.map((calendar) => {
            const calendarWithHours = calendarsWithWorkHours.find(
              (c) => c.id === calendar.id
            );
            return (
              <Link href={`/calendar/${calendar.id}`} key={calendar.id}>
                <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-accent/20 h-full">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2">
                        {calendar.name}
                      </h3>
                      {calendar.description && (
                        <p className=" line-clamp-3 min-h-[4.5em]">
                          {calendar.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-grow">
                      {calendar.settings && calendar.settings.length > 0 && (
                        <div className="text-sm text-muted-foreground mb-4">
                          {calendar.settings.map((setting, index) => (
                            <div key={index} className="mb-2">
                              <p className="flex items-center gap-2">
                                <Clock size={16} />
                                Laiko intervalas:{" "}
                                {setting.slot_duration_minutes} min
                              </p>
                              <p className="flex items-center gap-2">
                                <CalendarPlus size={16} />
                                Kelios rezervacijos:{" "}
                                {setting.allow_multiple_bookings
                                  ? "Leidžiamos"
                                  : "Neleidžiamos"}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar size={16} />
                                Įspėjimo laikas:{" "}
                                {setting.min_booking_notice_days} d.
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {calendarWithHours?.workHours && (
                        <div className="text-sm text-muted-foreground">
                          <h4 className="font-medium mb-2">Darbo valandos:</h4>
                          <div className="space-y-1">
                            {dayMap.map((day, index) => {
                              const dayHours = calendarWithHours.workHours.find(
                                (hours) => hours.day_of_week === index
                              );
                              return (
                                <p key={index} className="flex justify-between">
                                  <span>{day}:</span>
                                  <span>
                                    {dayHours ? (
                                      `${dayHours.start_time} - ${dayHours.end_time}`
                                    ) : (
                                      <span className="text-neutral-500 italic">
                                        Uždaryta
                                      </span>
                                    )}
                                  </span>
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
