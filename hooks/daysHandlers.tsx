import {
  getSpecialDaysById,
  getCalendarSettingsById,
  getWorkingHoursById,
} from "@/lib/actions";

//* For now im only creating a function to disable special days
//* in the calendar, but in the future I will maybe add a special workable days
//* feature, where only the workable hours are disabled

//! 1 Special, non workable days
//* 2 Special, workable days, but the time changes
//* 3 Special, workable days, but the time doesnt change

export async function getInvalidDays(id: string): Promise<number[]> {
  const workingHours = await getWorkingHoursById(id);
  const definedDays = workingHours.map((day) => day.day_of_week);

  const allDays = [0, 1, 2, 3, 4, 5, 6];

  // Find the days that are not in the DB
  const invalidDays = allDays.filter((day) => !definedDays.includes(day  ));

  // Find the days where start_time and end_time are null
  const noWorkingDay = workingHours
    .filter((day) => day.start_time === null && day.end_time === null)
    .map((day) => day.day_of_week);

  // Combine both, remove duplicates
  const combinedInvalidDays = Array.from(
    new Set([...invalidDays, ...noWorkingDay])
  );

  return combinedInvalidDays;
}

async function getDisabledDays(id: string) {
  const specialDays = await getSpecialDaysById(id); // Ves objekt
  const specialDates = specialDays.map((day) => day.date); // Sami dni

  const settings = await getCalendarSettingsById(id); // Nastrojki s kalendara
  const bookingDays = settings?.max_booking_days_ahead || 0; // Skolko dnej napered
  const noticeDays = settings?.min_booking_notice_days || 0; // Skolko dnej do

  const noWorkHoursDay = await getInvalidDays(id); // Dni bez rabotajushih chasov

  //* Return: max booking days ahead, special days. working hours,
  return { specialDates, bookingDays, noWorkHoursDay, noticeDays };
}

function setDisabledDays(id: string, days: string[]): void {
  console.log(`Setting disabled days for calendar ID: ${id}`, days);
}

export { getDisabledDays, setDisabledDays };
