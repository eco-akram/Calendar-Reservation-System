'use server'

import { createClient } from '@/utils/supabase/server'

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

  // Return null if login is successful
  return null;
}

export async function signup(formData: FormData): Promise<string | null> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
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
    min_booking_notice_hours: number;
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
    min_booking_notice_hours: number;
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
    console.error('Error fetching special days:', error.message);
    throw new Error('Failed to fetch special days');
  }

  return working_hours;
}