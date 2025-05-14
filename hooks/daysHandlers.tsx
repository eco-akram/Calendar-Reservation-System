import React from "react";
import {getSpecialDaysById, getCalendarSettingsById, getWorkingHoursById } from "@/lib/actions";



//* For now im only creating a function to disable special days
//* in the calendar, but in the future I will maybe add a special workable days
//* feature, where only the workable hours are disabled

//* 1 Special, non workable days
//* 2 Special, workable days, but the time changes
//* 3 Special, workable days, but the time doesnt change

export async function getInvalidDays(id: string): Promise<number[]> {
  const workingHours = await getWorkingHoursById(id);
  const definedDays = workingHours.map((day) => day.day_of_week);

  const allDays = [0, 1, 2, 3, 4, 5, 6];

  // Find the days that are not defined in working hours
  const invalidDays = allDays.filter((day) => !definedDays.includes(day));

  // Find the days where start_time and end_time are null
  const noWorkingDay = workingHours
    .filter((day) => day.start_time === null && day.end_time === null)
    .map((day) => day.day_of_week);

  // Combine both invalid days and remove duplicates
  const combinedInvalidDays = Array.from(new Set([...invalidDays, ...noWorkingDay]));

  return combinedInvalidDays;
}

async function getDisabledDays(id: string) {
    const specialDays = await getSpecialDaysById(id);
    const specialDates = specialDays.map((day) => day.date);

    const settings = await getCalendarSettingsById(id);
    const bookingDays = settings?.max_booking_days_ahead || 0;

    const noWorkHoursDay = await getInvalidDays(id);
    
    // Only dates from the special days

    //* Return: max booking days ahead, special days. working hours,
    return { specialDates, bookingDays, noWorkHoursDay };
}

function setDisabledDays(id: string, days: string[]): void {

  console.log(`Setting disabled days for calendar ID: ${id}`, days);
}

export { getDisabledDays, setDisabledDays };
