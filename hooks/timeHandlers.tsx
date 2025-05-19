import React from "react";
import {format} from "date-fns";

import {
  getCalendarSettingsById,
  getWorkingHoursById,
  getReservationsById,
} from "@/lib/actions";

export async function getDayInterval(calendarId: string) {
  const settings = await getCalendarSettingsById(calendarId);
  const slotDuration = settings?.slot_duration_minutes;
  return slotDuration;

  // Output: 30
}

export async function getDayWorkHours(calendarId: string, dayOfWeek: number) {
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

  // Output: { start_time: 2025-06-28 08:00, end_time: 2025-06-28 20:00 }
}

export async function checkForReservations(
  calendarId: string,
  selectedDate: Date
) {
  const reservations = await getReservationsById(calendarId);
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
/* console.log("Selected date string from timeHandlers:", selectedDateString, "Prop date:", selectedDate) */

  const dayReservations = reservations.filter((reservation) => {
    const reservationDate = new Date(reservation.start_time) 
      .toISOString()
      .split("T")[0]; 
    return reservationDate === selectedDateString;
  });

  
  return dayReservations;
}
export async function getDaySlots() {
  // Output:
  {
    {
      //start_time: 17:00,
      //end_time: 17:30
    }
    {
      //start_time: 17:30,
      //end_time: 18:00
    }
    {
      //start_time: 18:00,
      //end_time: 18:30
    }
    {
      //start_time: 18:30,
      //end_time: 19:00
    }
    {
      //start_time: 19:00,
      //end_time: 19:30
    }
  }
}
