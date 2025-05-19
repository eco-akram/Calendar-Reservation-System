"use client";
import {
  getCalendarById,
  Reservations,
  type CalendarWithSettings,
} from "@/lib/actions";
import { getDisabledDays } from "@/hooks/daysHandlers";
import {
  checkForReservations,
  getDayInterval,
  getDayWorkHours,
} from "@/hooks/timeHandlers";
import { useEffect, useState } from "react";
import { addMinutes, format, isWithinInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(
    new Date().getDay()
  );
  const [calendar, setCalendar] = useState<CalendarWithSettings | undefined>(
    undefined
  );
  const [disabledDays, setDisabledDays] = useState<string[]>([]);
  const [noWorkDays, setNoWorkDays] = useState<number[]>([]);
  const [bookingDays, setBookingDays] = useState<number>(0);
  const [workHours, setWorkHours] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
  const [reservations, setReservations] = useState<Reservations[]>([]);
  const [timeSlots, setTimeSlots] = useState<
    { start: Date; end: Date }[] | null
  >(null);
  const [interval, setInterval] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      if (!params?.id) return;

      // Checks if params.id is an array or a single value
      // If it's an array, take the first element
      // If it's a single value, use it directly
      // Pizdec TypeScript

      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      //* FETCHING *//
      const fetchedCalendar = await getCalendarById(id);
      const fetchedDisabledDays = await getDisabledDays(id);
      const fetchedInterval = await getDayInterval(id);

      //* SETTING STATES *//
      setCalendar(fetchedCalendar ?? undefined);
      setDisabledDays(
        fetchedDisabledDays.specialDates.map((date) =>
          format(date, "yyyy-MM-dd")
        )
      );
      setNoWorkDays(fetchedDisabledDays.noWorkHoursDay);
      setBookingDays(fetchedDisabledDays.bookingDays);
      setInterval(fetchedInterval ?? 0);

      //* CONSOLE LOGS *//
      console.log("Fetched day interval:", fetchedInterval);
      console.log("Disabled days:", fetchedDisabledDays);
    }
    fetchData();
  }, [params]);

  useEffect(() => {
    async function dateSelectHandler() {
      if (!params?.id) return;
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      //* FETCHING *//
      const fetchedWorkHours = await getDayWorkHours(id, selectedDayOfWeek);
      const fetchedReservations = await checkForReservations(id, selectedDate);

      //* SETTING STATES *//
      setWorkHours(fetchedWorkHours);
      setReservations(fetchedReservations);
      generateTimeSlots(selectedDate, interval);

      //* CONSOLE LOGS *//
      console.log(
        "Fetched work hours for selected day of week:",
        selectedDayOfWeek,
        fetchedWorkHours
      );
      console.log(
        "Fetched reservations for selected date:",
        selectedDate,
        fetchedReservations
      );
    }
    dateSelectHandler();
  }, [params, selectedDayOfWeek]);

  const generateTimeSlots = (date: Date, intervalMinutes: number) => {
    if (!workHours) return;

    const slots = [];
    let currentTime = new Date(workHours.startTime);

    while (currentTime < new Date(workHours.endTime)) {
      const slotEndTime = addMinutes(currentTime, intervalMinutes);

      // Only add slot if it doesn't overlap with reserved slots
      const isReserved = reservations.some(
        (reservation) =>
          isWithinInterval(currentTime, {
            start: reservation.start_time,
            end: reservation.end_time,
          }) ||
          isWithinInterval(slotEndTime, {
            start: reservation.start_time,
            end: reservation.end_time,
          })
      );

      if (!isReserved && slotEndTime <= new Date(workHours.endTime)) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEndTime),
        });
      }

      currentTime = addMinutes(currentTime, intervalMinutes);
    }
    console.log("Generated Time Slots:", slots);
    setTimeSlots(slots);
  };

  const isSlotReserved = (slot: { start: Date; end: Date }) => {
    return reservations.some(
      (reservation) =>
        slot.start.getTime() === reservation.start_time.getTime() &&
        slot.end.getTime() === reservation.end_time.getTime()
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date); // Update the selected date
      setSelectedDayOfWeek(date.getDay()); // Update the day of the week
    }
  };

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    // Add your booking logic here
    console.log("Selected slot:", slot);
  };

  if (!calendar || !disabledDays || !noWorkDays || bookingDays === null) {
    return <div className="p-4">Loading calendar data...</div>;
  }

  return (
    <div
      className="p-4 flex flex-row justify-items-center gap-4 border rounded-lg"
      suppressHydrationWarning
    >
      <div className="p-4 border rounded-lg">
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

      <Calendar
        className="rounded-md border shadow"
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
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
      />

      <div className="p-4 flex flex-col gap-2 border rounded-lg">
        {timeSlots && timeSlots.length > 0 ? (
          timeSlots.map((slot, index) => {
            const isReserved = isSlotReserved(slot);
            const startTime = format(slot.start, "HH:mm");
            const endTime = format(slot.end, "HH:mm");

            return (
              <Button
                key={index}
                variant={isReserved ? "outline" : "default"}
                disabled={isReserved}
                className={isReserved ? "text-gray-400" : ""}
                onClick={() => handleSlotSelect(slot)}
              >
                {startTime}-{endTime}
              </Button>
            );
          })
        ) : (
          <p>No available time slots for this date</p>
        )}
      </div>
    </div>
  );
}
