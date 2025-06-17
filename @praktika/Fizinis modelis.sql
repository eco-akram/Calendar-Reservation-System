CREATE TABLE calendars (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  name TEXT NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE bookings (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  calendar_id CHAR(36) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NULL,
  customer_phone TEXT NULL,
  custom_field_1 TEXT NULL,
  custom_field_2 TEXT NULL,
  custom_field_3 TEXT NULL,
  custom_field_4 TEXT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
);

CREATE TABLE calendar_settings (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  calendar_id CHAR(36) NOT NULL,
  slot_duration_minutes INT NULL DEFAULT 30,
  allow_multiple_bookings TINYINT(1) NULL DEFAULT 0,
  min_booking_notice_days INT NULL DEFAULT 24,
  max_booking_days_ahead INT NULL DEFAULT 30,
  custom_field_1_label TEXT NULL,
  custom_field_2_label TEXT NULL,
  custom_field_3_label TEXT NULL,
  custom_field_4_label TEXT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
);

CREATE TABLE special_days (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  calendar_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  is_working_day TINYINT(1) NULL DEFAULT 0,
  special_start_time TIME NULL,
  special_end_time TIME NULL,
  description TEXT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
);

CREATE TABLE working_hours (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  calendar_id CHAR(36) NOT NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
);