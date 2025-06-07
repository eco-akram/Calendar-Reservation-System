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
import { Calendar1, CalendarPlus, Clock } from "lucide-react";
import { ReservationDialog } from "@/components/reservationDialog";
import { lt } from "date-fns/locale";
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
  const [noticeDays, setNoticeDays] = useState<number>(0);
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
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<
    { start: Date; end: Date }[]
  >([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const findNextAvailableDate = (startDate: Date): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // Calculate the end date for the booking period
    const bookingEndDate = new Date(today);
    bookingEndDate.setDate(today.getDate() + bookingDays);

    // Calculate the date for the minimum notice period
    const noticePeriodEndDate = new Date(today);
    noticePeriodEndDate.setDate(today.getDate() + noticeDays);

    console.log('Finding next available date:', {
      today: format(today, 'yyyy-MM-dd'),
      startDate: format(startDate, 'yyyy-MM-dd'),
      currentDate: format(currentDate, 'yyyy-MM-dd'),
      bookingEndDate: format(bookingEndDate, 'yyyy-MM-dd'),
      noticePeriodEndDate: format(noticePeriodEndDate, 'yyyy-MM-dd'),
      disabledDays,
      noWorkDays,
      bookingDays,
      noticeDays
    });

    while (currentDate <= bookingEndDate) {
      const dateString = format(currentDate, "yyyy-MM-dd");
      const dayOfWeek = currentDate.getDay();

      // Check if the date is available
      const isAfterNoticePeriod = currentDate >= noticePeriodEndDate;
      const isNotDisabled = !disabledDays.includes(dateString);
      const isWorkDay = !noWorkDays.includes(dayOfWeek);

      console.log('Checking date:', {
        date: dateString,
        dayOfWeek,
        isAfterNoticePeriod,
        isNotDisabled,
        isWorkDay
      });

      if (isAfterNoticePeriod && isNotDisabled && isWorkDay) {
        console.log('Found available date:', dateString);
        return currentDate;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('No available date found, returning today');
    return today;
  };

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
      setNoticeDays(fetchedDisabledDays.noticeDays);
      setInterval(fetchedInterval ?? 0);

      // Set the initial selected date to the next available date
      const today = new Date();
      const nextAvailableDate = findNextAvailableDate(today);
      console.log('Setting initial date to:', format(nextAvailableDate, 'yyyy-MM-dd'));
      setSelectedDate(nextAvailableDate);
      setSelectedDayOfWeek(nextAvailableDate.getDay());
    }
    fetchData();
  }, [params]);

  // Add a new useEffect to handle initial date selection after states are set
  useEffect(() => {
    if (disabledDays.length > 0 || noWorkDays.length > 0 || bookingDays > 0 || noticeDays > 0) {
      const today = new Date();
      const nextAvailableDate = findNextAvailableDate(today);
      console.log('Updating initial date to:', format(nextAvailableDate, 'yyyy-MM-dd'));
      setSelectedDate(nextAvailableDate);
      setSelectedDayOfWeek(nextAvailableDate.getDay());
    }
  }, [disabledDays, noWorkDays, bookingDays, noticeDays]);

  useEffect(() => {
    async function dateSelectHandler() {
      if (!params?.id || !selectedDate) return;
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      console.log(
        "dateSelectHandler called with date:",
        format(selectedDate, "yyyy-MM-dd")
      );

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
        console.log(
          "Generating slots for date:",
          format(selectedDate, "yyyy-MM-dd")
        );
        setSlotsLoading(true);
        await generateTimeSlots(selectedDate, interval);
        setSlotsLoading(false);
      }
    }
    generate();
  }, [workHours, interval, selectedDate]);

  const generateTimeSlots = async (
    date: Date,
    intervalMinutes: number
  ): Promise<void> => {
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
      const roundedMinutes =
        Math.ceil(minutes / intervalMinutes) * intervalMinutes;
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
      console.log(
        "handleDateSelect called with date:",
        format(date, "yyyy-MM-dd")
      );
      setSelectedDate(date);
      setSelectedDayOfWeek(date.getDay());
    }
  };

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    if (!calendar?.settings?.[0]?.allow_multiple_bookings) {
      setSelectedSlot(slot);
      setDialogOpen(true);
      return;
    }

    setSelectedSlots((prev) => {
      const isSelected = prev.some(
        (s) =>
          s.start.getTime() === slot.start.getTime() &&
          s.end.getTime() === slot.end.getTime()
      );

      if (isSelected) {
        return prev.filter(
          (s) =>
            !(
              s.start.getTime() === slot.start.getTime() &&
              s.end.getTime() === slot.end.getTime()
            )
        );
      }

      return [...prev, slot];
    });
  };

  const handleConfirmSelection = () => {
    if (selectedSlots.length > 0) {
      setSelectedSlot(selectedSlots[0]); // Pass first slot to dialog
      setDialogOpen(true);
    }
  };

  const isSlotSelected = (slot: { start: Date; end: Date }) => {
    return selectedSlots.some(
      (s) =>
        s.start.getTime() === slot.start.getTime() &&
        s.end.getTime() === slot.end.getTime()
    );
  };

  if (!calendar || !disabledDays || !noWorkDays || bookingDays === null) {
    return (
      <main className="h-auto w-full flex items-center justify-center p-4 rounded-3xl bg-background m-2">
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
    <main className="h-auto w-full flex items-center justify-center p-4 rounded-3xl bg-background m-2">
      {/*       <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl border rounded-xl shadow-lg p-4 bg-gradient-to-t from-accent/20 to-card "> */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl border rounded-xl shadow-lg p-4 bg-accent/20 ">
        <div className="p-4 border rounded-lg shadow flex-1 min-w-[200px]">
          <h1 className="text-xl font-bold mb-2">{calendar.name}</h1>
          {calendar.description && (
            <p className="mb-2 line-clamp-6 text-sm">{calendar.description}</p>
          )}
          {calendar.settings && calendar.settings.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {calendar.settings.map((setting, index) => (
                <div key={index} className="mb-2">
                  <p className="flex items-center gap-2">
                    <Clock size={16} />
                    Slot duration: {setting.slot_duration_minutes} minutes
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarPlus size={16} />
                    Multiple bookings:
                    {setting.allow_multiple_bookings
                      ? " Allowed"
                      : " Not allowed"}
                  </p>

                  <p className="flex items-center gap-2">
                    <Calendar1 size={16} />
                    Notice days : {setting.min_booking_notice_days} days
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-[200px] h-[320px]">
          <Calendar
            mode="single"
            locale={lt}
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Calculate the end date for the booking period
              const bookingEndDate = new Date(today);
              bookingEndDate.setDate(today.getDate() + bookingDays);

              // Calculate the date for the minimum notice period
              const noticePeriodEndDate = new Date(today);
              noticePeriodEndDate.setDate(today.getDate() + noticeDays);

              const dateString = format(date, "yyyy-MM-dd");
              const dayOfWeek = date.getDay();

              // Disable dates based on conditions
              return (
                date < today || // Disable dates before today
                date < noticePeriodEndDate || // Disable dates within the notice period
                date > bookingEndDate || // Disable dates after the booking end date
                disabledDays.includes(dateString) || // Disable specific disabled dates
                noWorkDays.includes(dayOfWeek) // Disable days with no work hours
              );
            }}
            className="rounded-md border shadow h-full w-full"
          />
        </div>

        <div className="p-4 flex flex-col gap-2 border rounded-lg shadow flex-1 min-w-[200px] max-h-[320px] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              {selectedDate
                ? format(selectedDate, "d MMMM yyyy", { locale: lt })
                : "Select a date"}
            </h2>
            {calendar?.settings?.[0]?.allow_multiple_bookings &&
              selectedSlots.length > 0 && (
                <Button onClick={handleConfirmSelection} size="sm">
                  Confirm {selectedSlots.length} Slot
                  {selectedSlots.length > 1 ? "s" : ""}
                </Button>
              )}
          </div>
          {slotsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-full bg-gray-800 rounded animate-pulse"
              />
            ))
          ) : timeSlots ? (
            timeSlots.map((slot, index) => {
              const isReserved = isSlotReserved(slot);
              const isSelected = isSlotSelected(slot);
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full ${
                    isReserved
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : isSelected
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                  disabled={isReserved}
                  onClick={() => handleSlotSelect(slot)}
                >
                  <div className="flex items-center justify-center w-full">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-center">
                      {format(slot.start, "HH:mm")} -{" "}
                      {format(slot.end, "HH:mm")}
                    </span>
                  </div>
                </Button>
              );
            })
          ) : (
            <p>No available time slots for this date.</p>
          )}
        </div>
      </div>

      <ReservationDialog
        slot={selectedSlot}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        calendar={calendar}
        selectedSlots={selectedSlots}
      />
    </main>
  );
}
