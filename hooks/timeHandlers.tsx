import React from "react";
import { format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { UTCDate } from "@date-fns/utc";

import {
  getCalendarSettingsById,
  getWorkingHoursById,
  getReservationsById,
} from "@/lib/actions";

export async function getDayInterval(calendarId: string) {
  const settings = await getCalendarSettingsById(calendarId);
  const slotDuration = settings?.slot_duration_minutes;
  return slotDuration;

}

/* export async function getDayWorkHours(calendarId: string, dayOfWeek: number) {
  const allWorkingHours = await getWorkingHoursById(calendarId);
  const dayWorkingHours = allWorkingHours.find(
    (day) => day.day_of_week === dayOfWeek
  );

  const startTime = dayWorkingHours?.start_time || "08:00";
  const endTime = dayWorkingHours?.end_time || "20:00";

  return {
    startTime,
    endTime,
  };
} */

export async function getDayWorkHours(
  calendarId: string,
  dayOfWeek: number,
  selectedDate?: Date
) {
  const allWorkingHours = await getWorkingHoursById(calendarId);
  const dayWorkingHours = allWorkingHours.find(
    (day) => day.day_of_week === dayOfWeek
  );

  const timeStart = dayWorkingHours?.start_time || "08:00";
  const timeEnd = dayWorkingHours?.end_time || "20:00";

  const dateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  console.log("getDayWorkHours:", {
    dayOfWeek,
    selectedDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "none",
    dateStr,
    timeStart,
    timeEnd
  });

  const startTime = new Date(`${dateStr}T${timeStart}`);
  const endTime = new Date(`${dateStr}T${timeEnd}`);

  return { startTime, endTime };
}

export async function checkForReservations(
  calendarId: string,
  selectedDate: Date
) {
  const reservations = await getReservationsById(calendarId);
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");


  const dayReservations = reservations.filter((reservation) => {
    const reservationStart = new UTCDate(reservation.start_time);
    const reservationDateString = format(reservationStart, "yyyy-MM-dd");
    return reservationDateString === selectedDateString;
  });

  
  return dayReservations.map((reservation) => ({
    ...reservation,
    start_time: new UTCDate(reservation.start_time),
    end_time: new UTCDate(reservation.end_time),
  }));
}