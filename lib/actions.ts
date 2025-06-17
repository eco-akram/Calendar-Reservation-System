'use server'

import { createClient } from '@/utils/supabase/server'
import { sendReservationEmail } from './email';

export async function login(formData: FormData): Promise<string | null> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error.message);
    return error.message; 
  }

  return null;
}

export async function signup(formData: FormData): Promise<string | null> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    display_name: formData.get('name') as string,
    options: {
        data: {
          display_name: formData.get('name') as string
        },
      },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    return error.message; 
  }

  return null;
}

export async function logout(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    throw new Error(error.message);
  }
}

export type CalendarWithSettings = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  settings: [{
    id: string;
    slot_duration_minutes: number;
    allow_multiple_bookings: boolean;
    min_booking_notice_days: number;
    max_booking_days_ahead: number;
    custom_field_1_label: string | null;
    custom_field_2_label: string | null;
    custom_field_3_label: string | null;
    custom_field_4_label: string | null;
  } ]| null;
};

export async function getCalendars(): Promise<CalendarWithSettings[]> {
  const supabase = await createClient();

  const { data: calendars, error } = await supabase
    .from('calendars')
    .select(`
      *,
      settings:calendar_settings(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching calendars:', error.message);
    throw new Error('Failed to fetch calendars');
  }

  return calendars;
}

export async function getCalendarById(id: string): Promise<CalendarWithSettings | null> {
  const supabase = await createClient();

  const { data: calendar, error } = await supabase
    .from('calendars')
    .select(`
      *,
      settings:calendar_settings(*)
    `)
    .eq('id', id)
    .single(); 

  if (error) {
    console.error('Error fetching calendar by ID:', error.message);
    throw new Error('Failed to fetch calendar');
  }

  return calendar;
}

export type CalendarSettings = {
    id: string;
    slot_duration_minutes: number;
    allow_multiple_bookings: boolean;
    min_booking_notice_days: number;
    max_booking_days_ahead: number;
    custom_field_1_label: string | null;
    custom_field_2_label: string | null;
    custom_field_3_label: string | null;
    custom_field_4_label: string | null;
};

export async function getCalendarSettingsById(id: string): Promise<CalendarSettings | null> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from('calendar_settings')
    .select(`
      *
    `)
    .eq('calendar_id', id)
    .single();

  if (error) {
    console.error('Error fetching calendar by ID:', error.message);
    throw new Error('Failed to fetch calendar');
  }

  return settings;
}

export type SpecialDays = {
  id: string;
  calendar_id: string;
  date: Date;
  is_working_day: boolean;
  special_start_time: string | null;
  special_end_time: string | null;
  description: string | null;
};

export async function getSpecialDaysById(id: string): Promise<SpecialDays[]> {
  const supabase = await createClient();

  const { data: special_days, error } = await supabase
    .from('special_days')
    .select(`
      *
    `)
    .eq('calendar_id', id)

  if (error) {
    console.error('Error fetching special days:', error.message);
    throw new Error('Failed to fetch special days');
  }

  return special_days;
}

export type WorkingHours = {
  id: string;
  calendar_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export async function getWorkingHoursById(id: string): Promise<WorkingHours[]> {
  const supabase = await createClient();

  const { data: working_hours, error } = await supabase
    .from('working_hours')
    .select(`
      *
    `)
    .eq('calendar_id', id)

  if (error) {
    console.error('Error fetching working hours:', error.message);
    throw new Error('Failed to fetch working hours');
  }

  return working_hours;
}

export type Reservations = {
  id: string;
  calendar_id: string;
  start_time: Date;
  end_time: Date;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  custom_field_1: string | null;
  custom_field_2: string | null;
  custom_field_3: string | null;
  custom_field_4: string | null;
};

export async function getReservationsById(id: string): Promise<Reservations[]> {
  const supabase = await createClient();

  const { data: reservations, error } = await supabase
    .from('bookings')
    .select(`
      *
    `)
    .eq('calendar_id', id)

  if (error) {
    console.error('Error fetching reservations:', error.message);
    throw new Error('Failed to fetch reservations');
  }

  return reservations;
}

export async function getAllReservations(): Promise<Reservations[]> {
  const supabase = await createClient();

  const { data: reservations, error } = await supabase
    .from('bookings')
    .select(`
      *
    `)

  if (error) {
    console.error('Error fetching all reservations:', error.message);
    throw new Error('Failed to fetch all reservations');
  }

  return reservations;
}

interface CreateReservationData {
  id?: string;  
  calendar_id: string;
  start_time: Date;
  end_time: Date;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  custom_field_1: string | null;
  custom_field_2: string | null;
  custom_field_3: string | null;
  custom_field_4: string | null;
}

export async function createReservation(data: CreateReservationData) {
  try {
    const supabase = await createClient();
    
    const { data: calendar, error: calendarError } = await supabase
      .from('calendars')
      .select('name')
      .eq('id', data.calendar_id)
      .single();

    if (calendarError) {
      console.error('Error fetching calendar:', calendarError);
      throw calendarError;
    }

    const { data: reservation, error } = await supabase
      .from('bookings')
      .insert([
        {
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          start_time: data.start_time,
          end_time: data.end_time,
          calendar_id: data.calendar_id,
          custom_field_1: data.custom_field_1,
          custom_field_2: data.custom_field_2,
          custom_field_3: data.custom_field_3,
          custom_field_4: data.custom_field_4,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }

    if (data.customer_email) {
      try {
        await sendReservationEmail({
          to: data.customer_email,
          reservation: {
            customer_name: data.customer_name,
            start_time: data.start_time,
            end_time: data.end_time,
            calendar_name: calendar?.name || 'Kalendorius',
          },
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    return reservation;
  } catch (error) {
    console.error('Error in createReservation:', error);
    throw error;
  }
}

export async function deleteReservation(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteReservation:', error);
    throw error;
  }
}

export async function deleteReservations(ids: string[]) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('bookings')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting reservations:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteReservations:', error);
    throw error;
  }
}

interface CalendarFormData {
  name: string;
  description: string;
  slot_duration_minutes: number;
  allow_multiple_bookings: boolean;
  min_booking_notice_days: number;
  max_booking_days_ahead: number;
  working_hours: {
    [key: string]: {
      start: string;
      end: string;
      enabled: boolean;
    };
  };
  special_days: {
    date: string;
    is_working_day: boolean;
    working_hours?: {
      start: string;
      end: string;
    };
  }[];
}

export async function createCalendar(data: CalendarFormData) {
  try {
    const supabase = await createClient();
    
    const { data: calendar, error: calendarError } = await supabase
      .from('calendars')
      .insert({
        name: data.name,
        description: data.description,
      })
      .select()
      .single();

    if (calendarError) {
      console.error('Error creating calendar:', calendarError);
      throw calendarError;
    }

    const { error: settingsError } = await supabase
      .from('calendar_settings')
      .insert({
        calendar_id: calendar.id,
        slot_duration_minutes: data.slot_duration_minutes,
        allow_multiple_bookings: data.allow_multiple_bookings,
        min_booking_notice_days: data.min_booking_notice_days,
        max_booking_days_ahead: data.max_booking_days_ahead,
      });

    if (settingsError) {
      console.error('Error creating calendar settings:', settingsError);
      throw settingsError;
    }

    const workingHoursToInsert = Object.entries(data.working_hours)
      .filter(([, hours]) => hours.enabled)
      .map(([day, hours], index) => ({
        calendar_id: calendar.id,
        day_of_week: day === "sunday" ? 0 : index + 1,
        start_time: hours.start,
        end_time: hours.end,
      }));

    if (workingHoursToInsert.length > 0) {
      const { error: workingHoursError } = await supabase
        .from('working_hours')
        .insert(workingHoursToInsert);

      if (workingHoursError) {
        console.error('Error creating working hours:', workingHoursError);
        throw workingHoursError;
      }
    }

    if (data.special_days.length > 0) {
      const specialDaysToInsert = data.special_days.map(day => ({
        calendar_id: calendar.id,
        date: day.date,
        is_working_day: day.is_working_day,
        special_start_time: day.working_hours?.start || null,
        special_end_time: day.working_hours?.end || null,
      }));

      const { error: specialDaysError } = await supabase
        .from('special_days')
        .insert(specialDaysToInsert);

      if (specialDaysError) {
        console.error('Error creating special days:', specialDaysError);
        throw specialDaysError;
      }
    }

    return calendar;
  } catch (error) {
    console.error('Error in createCalendar:', error);
    throw error;
  }
}

export async function deleteCalendar(id: string) {
  try {
    const supabase = await createClient();
    
    const { error: calendarError } = await supabase
      .from('calendars')
      .delete()
      .eq('id', id)

    if (calendarError) {
      console.error('Error deleting calendar:', calendarError);
      throw calendarError;
    }

    const { error: settingsError } = await supabase
      .from('calendar_settings')
      .delete()
      .eq('calendar_id', id);

    if (settingsError) {
      console.error('Error deleting calendar settings:', settingsError);
      throw settingsError;
    }


    const { error: workingHoursError } = await supabase
      .from('working_hours')
      .delete()
      .eq('calendar_id', id);

    if (workingHoursError) {
      console.error('Error deleting working hours:', workingHoursError);
      throw workingHoursError;
    }

    const { error: specialDaysError } = await supabase
      .from('special_days')
      .delete()
      .eq('calendar_id', id);

    if (specialDaysError) {
      console.error('Error deleting special days:', specialDaysError);
      throw specialDaysError;
    }

  } catch (error) {
    console.error('Error in deleteCalendar:', error);
    throw error;
  }
}

export async function updateCalendar(id: string, data: CalendarFormData) {
  try {
    const supabase = await createClient();
    
    const { error: calendarError } = await supabase
      .from('calendars')
      .update({
        name: data.name,
        description: data.description,
      })
      .eq('id', id);

    if (calendarError) {
      console.error('Error updating calendar:', calendarError);
      throw calendarError;
    }

    const { error: settingsError } = await supabase
      .from('calendar_settings')
      .update({
        slot_duration_minutes: data.slot_duration_minutes,
        allow_multiple_bookings: data.allow_multiple_bookings,
        min_booking_notice_days: data.min_booking_notice_days,
        max_booking_days_ahead: data.max_booking_days_ahead,
      })
      .eq('calendar_id', id);

    if (settingsError) {
      console.error('Error updating calendar settings:', settingsError);
      throw settingsError;
    }

    const { error: deleteWorkingHoursError } = await supabase
      .from('working_hours')
      .delete()
      .eq('calendar_id', id);

    if (deleteWorkingHoursError) {
      console.error('Error deleting working hours:', deleteWorkingHoursError);
      throw deleteWorkingHoursError;
    }

    const workingHoursToInsert = Object.entries(data.working_hours)
      .filter(([, hours]) => hours.enabled)
      .map(([day, hours], index) => ({
        calendar_id: id,
        day_of_week: day === "sunday" ? 0 : index + 1,
        start_time: hours.start,
        end_time: hours.end,
      }));

    if (workingHoursToInsert.length > 0) {
      const { error: workingHoursError } = await supabase
        .from('working_hours')
        .insert(workingHoursToInsert);

      if (workingHoursError) {
        console.error('Error creating working hours:', workingHoursError);
        throw workingHoursError;
      }
    }

    const { error: deleteSpecialDaysError } = await supabase
      .from('special_days')
      .delete()
      .eq('calendar_id', id);

    if (deleteSpecialDaysError) {
      console.error('Error deleting special days:', deleteSpecialDaysError);
      throw deleteSpecialDaysError;
    }

    if (data.special_days.length > 0) {
      const specialDaysToInsert = data.special_days.map(day => ({
        calendar_id: id,
        date: day.date,
        is_working_day: day.is_working_day,
        special_start_time: day.working_hours?.start || null,
        special_end_time: day.working_hours?.end || null,
      }));

      const { error: specialDaysError } = await supabase
        .from('special_days')
        .insert(specialDaysToInsert);

      if (specialDaysError) {
        console.error('Error creating special days:', specialDaysError);
        throw specialDaysError;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateCalendar:', error);
    throw error;
  }
}