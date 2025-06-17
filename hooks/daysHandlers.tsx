import {
  getSpecialDaysById,
  getCalendarSettingsById,
  getWorkingHoursById,
} from "@/lib/actions";

export async function getInvalidDays(id: string): Promise<number[]> {
  const workingHours = await getWorkingHoursById(id);
  const definedDays = workingHours.map((day) => day.day_of_week);

  const allDays = [0, 1, 2, 3, 4, 5, 6];

  const invalidDays = allDays.filter((day) => !definedDays.includes(day  ));

  const noWorkingDay = workingHours
    .filter((day) => day.start_time === null && day.end_time === null)
    .map((day) => day.day_of_week);

  const combinedInvalidDays = Array.from(
    new Set([...invalidDays, ...noWorkingDay])
  );

  return combinedInvalidDays;
}

async function getDisabledDays(id: string) {
  const specialDays = await getSpecialDaysById(id);
  const specialDates = specialDays.map((day) => day.date);

  const settings = await getCalendarSettingsById(id);
  const bookingDays = settings?.max_booking_days_ahead || 0;
  const noticeDays = settings?.min_booking_notice_days || 0;

  const noWorkHoursDay = await getInvalidDays(id);

  return { specialDates, bookingDays, noWorkHoursDay, noticeDays };
}

function setDisabledDays(id: string, days: string[]): void {
  console.log(`Setting disabled days for calendar ID: ${id}`, days);
}

export { getDisabledDays, setDisabledDays };
