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
import { addMinutes, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Clock } from "lucide-react";
import { ReservationDialog } from "@/components/reservationDialog";

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
    startTime: Date;
    endTime: Date;
  } | null>(null);
  const [reservations, setReservations] = useState<Reservations[]>([]);
  const [timeSlots, setTimeSlots] = useState<
    { start: Date; end: Date }[] | null
  >(null);
  const [interval, setInterval] = useState<number>(0);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!params?.id) return;

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

      // Check if today is disabled
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = format(today, "yyyy-MM-dd");
      
      // Get the day of week (0-6, where 0 is Sunday)
      const dayOfWeek = today.getDay();
      console.log("Day of week for", format(today, "yyyy-MM-dd"), "is", dayOfWeek);
      
      const isNoWorkDay = fetchedDisabledDays.noWorkHoursDay.includes(dayOfWeek);
      const isSpecialDate = fetchedDisabledDays.specialDates.some(date => format(date, "yyyy-MM-dd") === todayString);
      
      const isTodayDisabled = isNoWorkDay || isSpecialDate;

      console.log("Initial date check:", {
        today: format(today, "yyyy-MM-dd"),
        dayOfWeek,
        isTodayDisabled,
        isNoWorkDay,
        isSpecialDate,
        noWorkDays: fetchedDisabledDays.noWorkHoursDay,
        specialDates: fetchedDisabledDays.specialDates.map(d => format(d, "yyyy-MM-dd"))
      });

      if (isTodayDisabled) {
        // Find next available date
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + 1);
        
        while (true) {
          const nextDateString = format(nextDate, "yyyy-MM-dd");
          const nextDayOfWeek = nextDate.getDay();
          const isNextDateDisabled = 
            fetchedDisabledDays.noWorkHoursDay.includes(nextDayOfWeek) ||
            fetchedDisabledDays.specialDates.some(date => format(date, "yyyy-MM-dd") === nextDateString);

          if (!isNextDateDisabled) {
            console.log("Setting next available date:", format(nextDate, "yyyy-MM-dd"));
            setSelectedDate(nextDate);
            setSelectedDayOfWeek(nextDayOfWeek);
            break;
          }
          nextDate.setDate(nextDate.getDate() + 1);
        }
      } else {
        // If today is not disabled, set it as the selected date
        console.log("Setting today as selected date:", format(today, "yyyy-MM-dd"));
        setSelectedDate(today);
        setSelectedDayOfWeek(dayOfWeek);
      }
    }
    fetchData();
  }, [params]);

  useEffect(() => {
    async function dateSelectHandler() {
      if (!params?.id || !selectedDate) return;
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      console.log("dateSelectHandler called with date:", format(selectedDate, "yyyy-MM-dd"));

      //* FETCHING *//
      const fetchedWorkHours = await getDayWorkHours(
        id,
        selectedDayOfWeek,
        selectedDate
      );
      const fetchedReservations = await checkForReservations(id, selectedDate);

      //* SETTING STATES *//
      setWorkHours(fetchedWorkHours);
      setReservations(fetchedReservations);

      
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
  }, [params, selectedDate, selectedDayOfWeek]);

  useEffect(() => {
    async function generate() {
      if (workHours && interval > 0) {
        console.log("Generating slots for date:", format(selectedDate, "yyyy-MM-dd"));
        setSlotsLoading(true); 
        await generateTimeSlots(selectedDate, interval);
        setSlotsLoading(false);
      }
    }
    generate();
  }, [workHours, interval, selectedDate]);
  

  const generateTimeSlots = async (date: Date, intervalMinutes: number): Promise<void>  => {
    if (!workHours) return;

    const slots = [];
    let currentTime = new Date(workHours.startTime);

    // If the selected date is today, start from the current time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateStart = new Date(date);
    selectedDateStart.setHours(0, 0, 0, 0);

    if (selectedDateStart.getTime() === today.getTime()) {
      // Round up to the next interval
      const now = new Date();
      const minutes = now.getMinutes();
      const roundedMinutes = Math.ceil(minutes / intervalMinutes) * intervalMinutes;
      currentTime = new Date(now);
      currentTime.setMinutes(roundedMinutes);
      currentTime.setSeconds(0);
      currentTime.setMilliseconds(0);

      // If the rounded time is before work hours, start from work hours
      if (currentTime < workHours.startTime) {
        currentTime = new Date(workHours.startTime);
      }
    }

    while (currentTime < new Date(workHours.endTime)) {
      const slotEndTime = addMinutes(currentTime, intervalMinutes);

      // Only add slot if it doesn't overlap with reserved slots
      const isReserved = reservations.some((reservation) => {
        const reservationStart = new Date(reservation.start_time);
        const reservationEnd = new Date(reservation.end_time);

        // A slot is reserved only if it exactly matches a reservation
        return (
          currentTime.getTime() === reservationStart.getTime() &&
          slotEndTime.getTime() === reservationEnd.getTime()
        );
      });

      if (!isReserved && slotEndTime <= new Date(workHours.endTime)) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEndTime),
        });
      }

      currentTime = addMinutes(currentTime, intervalMinutes);
    }
    setTimeSlots(slots);

  };

  const isSlotReserved = (slot: { start: Date; end: Date }) => {
    if (!reservations || reservations.length === 0) {
      return false;
    }

    return reservations.some((reservation) => {
      const reservationStart = reservation.start_time;
      const reservationEnd = reservation.end_time;

      // A slot is reserved only if it exactly matches a reservation
      return (
        slot.start.getTime() === reservationStart.getTime() &&
        slot.end.getTime() === reservationEnd.getTime()
      );
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log("handleDateSelect called with date:", format(date, "yyyy-MM-dd"));
      setSelectedDate(date);
      setSelectedDayOfWeek(date.getDay());
    }
  };

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    setSelectedSlot(slot);
    setDialogOpen(true);
  };

  if (!calendar || !disabledDays || !noWorkDays || bookingDays === null) {
    return (
      <main className="h-auto w-full flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl border rounded-lg shadow-lg p-4">
          {/* Info Skeleton */}
          <div className="p-4 border rounded-lg shadow flex-1 min-w-[200px] flex flex-col animate-pulse">
            <div className="h-7 w-1/2 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-800 rounded mb-2" />
            <div className="flex flex-col gap-2 mt-4">
              <div className="h-4 w-2/3 bg-gray-800 rounded" />
              <div className="h-4 w-1/2 bg-gray-800 rounded" />
            </div>
          </div>
          {/* Calendar Skeleton */}
          <div className="flex min-w-[200px] flex-1">
            <div className="rounded-md border shadow h-full w-full flex items-center justify-center animate-pulse">
              <div className="h-5/6 w-5/6 bg-gray-800 rounded" />
            </div>
          </div>
          {/* Slots Skeleton */}
          <div className="p-4 flex flex-col gap-2 border rounded-lg shadow flex-1 min-w-[200px] max-h-[290px] overflow-y-auto animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-auto w-full flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl border rounded-lg shadow-lg p-4">
        <div className="p-4 border rounded-lg shadow flex-1 min-w-[200px]">
          <h1 className="text-xl font-bold mb-2">{calendar.name}</h1>
          {calendar.description && (
            <p className="mb-2 text-sm">{calendar.description}</p>
          )}
          {calendar.settings && calendar.settings.length > 0 && (
            <div className="text-sm text-gray-500">
              {calendar.settings.map((setting, index) => (
                <div key={index} className="mb-2">
                  <p className="flex items-center gap-2">
                    <Clock size={16} />
                    Slot duration: {setting.slot_duration_minutes} minutes
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarPlus size={16}/>
                    Multiple bookings:
                    {setting.allow_multiple_bookings
                      ? " Allowed"
                      : " Not allowed"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-[200px]">
          <Calendar
            className="rounded-md border shadow h-full w-full"
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const bookingEndDate = new Date(today);
              bookingEndDate.setDate(today.getDate() + bookingDays);

              const dateString = format(date, "yyyy-MM-dd");

              const dayOfWeek = date.getDay();

              return (
                date < today ||
                date > bookingEndDate ||
                disabledDays.includes(dateString) ||
                noWorkDays.includes(dayOfWeek)
              );
            }}
          />
        </div>

        <div className="p-4 flex flex-col gap-2 border rounded-lg shadow flex-1 min-w-[200px] max-h-[290px] overflow-y-auto">
          {slotsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-800 rounded animate-pulse" />
            ))
          ) : timeSlots && timeSlots.length > 0 ? (
            timeSlots.map((slot, index) => {
              const isReserved = reservations.length > 0 && isSlotReserved(slot);
              const startTime = format(slot.start, "HH:mm");
              const endTime = format(slot.end, "HH:mm");

              return (
                <Button
                  key={index}
                  variant={isReserved ? "secondary" : "default"}
                  disabled={isReserved}
                  className={isReserved ? "opacity-50 cursor-not-allowed" : ""}
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
        <ReservationDialog 
          slot={selectedSlot}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          calendar={calendar}
        />
      </div>
    </main>
  );
}
