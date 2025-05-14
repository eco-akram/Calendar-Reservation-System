"use client";
import { getCalendarById, type CalendarWithSettings } from "@/lib/actions";
import { getDisabledDays } from "@/hooks/daysHandlers";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useParams } from "next/navigation";

export default function CalendarPage() {
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [calendar, setCalendar] = useState<CalendarWithSettings | undefined>(
    undefined
  );
  const [disabledDays, setDisabledDays] = useState<string[]>([]);
  const [noWorkDays, setNoWorkDays] = useState<number[]>([]);
  const [bookingDays, setBookingDays] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      if (!params?.id) return;

      // Checks if params.id is an array or a single value
      // If it's an array, take the first element
      // If it's a single value, use it directly
      // Pizdec TypeScript
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      const fetchedCalendar = await getCalendarById(id);
      const fetchedDisabledDays = await getDisabledDays(id);

      setCalendar(fetchedCalendar);
      setDisabledDays(fetchedDisabledDays.specialDates);
      setNoWorkDays(fetchedDisabledDays.noWorkHoursDay);
      setBookingDays(fetchedDisabledDays.bookingDays);

      console.log(
        `Disabled days for calendar ID ${params.id}:`,
        fetchedDisabledDays
      );
    }
    fetchData();
  }, [params]);

  if (!calendar || !disabledDays || !noWorkDays || bookingDays === null) {
    return <div className="p-4">Loading calendar data...</div>;
  }

  return (
    <div className="p-4" suppressHydrationWarning>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        disabled={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize today's date

          // Calculate end of booking period (today + 40 days)
          const bookingEndDate = new Date(today);
          bookingEndDate.setDate(today.getDate() + bookingDays);

          const dateString = format(date, "yyyy-MM-dd");

          // Get day of week (0 = Sunday, 6 = Saturday)
          const dayOfWeek = date.getDay();

          return (
            date < today ||
            date > bookingEndDate ||
            disabledDays.includes(dateString) ||
            noWorkDays.includes(dayOfWeek)
          );
        }}
        className="rounded-md border shadow"
      />

      <h1 className="text-2xl font-bold mb-4">{calendar.name}</h1>
      {calendar.description && <p className="mb-2">{calendar.description}</p>}
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
  );
}
