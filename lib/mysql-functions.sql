-- Kalendoriaus funkcijos
DELIMITER //

CREATE FUNCTION get_calendars_with_settings()
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'settings', JSON_ARRAY(
                JSON_OBJECT(
                    'id', cs.id,
                    'slot_duration_minutes', cs.slot_duration_minutes,
                    'allow_multiple_bookings', cs.allow_multiple_bookings,
                    'min_booking_notice_days', cs.min_booking_notice_days,
                    'max_booking_days_ahead', cs.max_booking_days_ahead,
                    'custom_field_1_label', cs.custom_field_1_label,
                    'custom_field_2_label', cs.custom_field_2_label,
                    'custom_field_3_label', cs.custom_field_3_label,
                    'custom_field_4_label', cs.custom_field_4_label
                )
            )
        )
    ) INTO result
    FROM calendars c
    LEFT JOIN calendar_settings cs ON c.id = cs.calendar_id
    ORDER BY c.created_at DESC;
    
    RETURN result;
END //

CREATE FUNCTION get_calendar_by_id(calendar_id CHAR(36))
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'settings', JSON_ARRAY(
                JSON_OBJECT(
                    'id', cs.id,
                    'slot_duration_minutes', cs.slot_duration_minutes,
                    'allow_multiple_bookings', cs.allow_multiple_bookings,
                    'min_booking_notice_days', cs.min_booking_notice_days,
                    'max_booking_days_ahead', cs.max_booking_days_ahead,
                    'custom_field_1_label', cs.custom_field_1_label,
                    'custom_field_2_label', cs.custom_field_2_label,
                    'custom_field_3_label', cs.custom_field_3_label,
                    'custom_field_4_label', cs.custom_field_4_label
                )
            )
        )
    ) INTO result
    FROM calendars c
    LEFT JOIN calendar_settings cs ON c.id = cs.calendar_id
    WHERE c.id = calendar_id;
    
    RETURN result;
END //

-- Darbo valandų funkcijos
CREATE FUNCTION get_working_hours_by_calendar(calendar_id CHAR(36))
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', wh.id,
            'calendar_id', wh.calendar_id,
            'day_of_week', wh.day_of_week,
            'start_time', wh.start_time,
            'end_time', wh.end_time
        )
    ) INTO result
    FROM working_hours wh
    WHERE wh.calendar_id = calendar_id
    ORDER BY wh.day_of_week;
    
    RETURN result;
END //

-- Specialių dienų funkcijos
CREATE FUNCTION get_special_days_by_calendar(calendar_id CHAR(36))
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', sd.id,
            'calendar_id', sd.calendar_id,
            'date', sd.date,
            'is_working_day', sd.is_working_day,
            'special_start_time', sd.special_start_time,
            'special_end_time', sd.special_end_time,
            'description', sd.description
        )
    ) INTO result
    FROM special_days sd
    WHERE sd.calendar_id = calendar_id
    ORDER BY sd.date;
    
    RETURN result;
END //

-- Rezervacijų funkcijos
CREATE FUNCTION get_reservations_by_calendar(calendar_id CHAR(36))
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', b.id,
            'calendar_id', b.calendar_id,
            'start_time', b.start_time,
            'end_time', b.end_time,
            'customer_name', b.customer_name,
            'customer_email', b.customer_email,
            'customer_phone', b.customer_phone,
            'custom_field_1', b.custom_field_1,
            'custom_field_2', b.custom_field_2,
            'custom_field_3', b.custom_field_3,
            'custom_field_4', b.custom_field_4
        )
    ) INTO result
    FROM bookings b
    WHERE b.calendar_id = calendar_id
    ORDER BY b.start_time;
    
    RETURN result;
END //

CREATE FUNCTION get_all_reservations()
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', b.id,
            'calendar_id', b.calendar_id,
            'start_time', b.start_time,
            'end_time', b.end_time,
            'customer_name', b.customer_name,
            'customer_email', b.customer_email,
            'customer_phone', b.customer_phone,
            'custom_field_1', b.custom_field_1,
            'custom_field_2', b.custom_field_2,
            'custom_field_3', b.custom_field_3,
            'custom_field_4', b.custom_field_4
        )
    ) INTO result
    FROM bookings b
    ORDER BY b.start_time;
    
    RETURN result;
END //

-- Kūrimo/Atnaujinimo/Ištrynimo procedūros
CREATE PROCEDURE create_calendar(
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_slot_duration INT,
    IN p_allow_multiple BOOLEAN,
    IN p_min_notice INT,
    IN p_max_ahead INT,
    IN p_working_hours JSON,
    IN p_special_days JSON
)
BEGIN
    DECLARE v_calendar_id CHAR(36);
    DECLARE i INT DEFAULT 0;
    DECLARE working_hours_count INT;
    DECLARE special_days_count INT;
    
    -- Sukurti kalendorių
    INSERT INTO calendars (name, description)
    VALUES (p_name, p_description);
    
    SET v_calendar_id = LAST_INSERT_ID();
    
    -- Sukurti kalendoriaus nustatymus
    INSERT INTO calendar_settings (
        calendar_id,
        slot_duration_minutes,
        allow_multiple_bookings,
        min_booking_notice_days,
        max_booking_days_ahead
    )
    VALUES (
        v_calendar_id,
        p_slot_duration,
        p_allow_multiple,
        p_min_notice,
        p_max_ahead
    );
    
    -- Sukurti darbo valandas
    SET working_hours_count = JSON_LENGTH(p_working_hours);
    WHILE i < working_hours_count DO
        INSERT INTO working_hours (
            calendar_id,
            day_of_week,
            start_time,
            end_time
        )
        VALUES (
            v_calendar_id,
            JSON_EXTRACT(p_working_hours, CONCAT('$[', i, '].day_of_week')),
            JSON_EXTRACT(p_working_hours, CONCAT('$[', i, '].start_time')),
            JSON_EXTRACT(p_working_hours, CONCAT('$[', i, '].end_time'))
        );
        SET i = i + 1;
    END WHILE;
    
    -- Sukurti specialias dienas
    SET i = 0;
    SET special_days_count = JSON_LENGTH(p_special_days);
    WHILE i < special_days_count DO
        INSERT INTO special_days (
            calendar_id,
            date,
            is_working_day,
            special_start_time,
            special_end_time
        )
        VALUES (
            v_calendar_id,
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].date')),
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].is_working_day')),
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].special_start_time')),
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].special_end_time'))
        );
        SET i = i + 1;
    END WHILE;
    
    SELECT v_calendar_id;
END //

-- Atnaujinti kalendorių
CREATE PROCEDURE update_calendar(
    IN p_calendar_id CHAR(36),
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_slot_duration INT,
    IN p_allow_multiple BOOLEAN,
    IN p_min_notice INT,
    IN p_max_ahead INT,
    IN p_working_hours JSON,
    IN p_special_days JSON
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE working_hours_count INT;
    DECLARE special_days_count INT;
    
    -- Atnaujinti kalendorių
    UPDATE calendars 
    SET name = p_name, description = p_description
    WHERE id = p_calendar_id;
    
    -- Atnaujinti kalendoriaus nustatymus
    UPDATE calendar_settings
    SET slot_duration_minutes = p_slot_duration,
        allow_multiple_bookings = p_allow_multiple,
        min_booking_notice_days = p_min_notice,
        max_booking_days_ahead = p_max_ahead
    WHERE calendar_id = p_calendar_id;
    
    -- Ištrinti senas darbo valandas
    DELETE FROM working_hours WHERE calendar_id = p_calendar_id;
    
    -- Sukurti naujas darbo valandas
    SET working_hours_count = JSON_LENGTH(p_working_hours);
    WHILE i < working_hours_count DO
        INSERT INTO working_hours (
            calendar_id,
            day_of_week,
            start_time,
            end_time
        )
        VALUES (
            p_calendar_id,
            JSON_EXTRACT(p_working_hours, CONCAT('$[', i, '].day_of_week')),
            JSON_EXTRACT(p_working_hours, CONCAT('$[', i, '].start_time')),
            JSON_EXTRACT(p_working_hours, CONCAT('$[', i, '].end_time'))
        );
        SET i = i + 1;
    END WHILE;
    
    -- Ištrinti senas specialias dienas
    DELETE FROM special_days WHERE calendar_id = p_calendar_id;
    
    -- Sukurti naujas specialias dienas
    SET i = 0;
    SET special_days_count = JSON_LENGTH(p_special_days);
    WHILE i < special_days_count DO
        INSERT INTO special_days (
            calendar_id,
            date,
            is_working_day,
            special_start_time,
            special_end_time
        )
        VALUES (
            p_calendar_id,
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].date')),
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].is_working_day')),
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].special_start_time')),
            JSON_EXTRACT(p_special_days, CONCAT('$[', i, '].special_end_time'))
        );
        SET i = i + 1;
    END WHILE;
END //

-- Ištrinti kalendorių
CREATE PROCEDURE delete_calendar(IN p_calendar_id CHAR(36))
BEGIN
    -- Ištrinti susijusius įrašus
    DELETE FROM special_days WHERE calendar_id = p_calendar_id;
    DELETE FROM working_hours WHERE calendar_id = p_calendar_id;
    DELETE FROM calendar_settings WHERE calendar_id = p_calendar_id;
    DELETE FROM bookings WHERE calendar_id = p_calendar_id;
    DELETE FROM calendars WHERE id = p_calendar_id;
END //

-- Sukurti rezervaciją
CREATE PROCEDURE create_reservation(
    IN p_calendar_id CHAR(36),
    IN p_start_time DATETIME,
    IN p_end_time DATETIME,
    IN p_customer_name VARCHAR(255),
    IN p_customer_email VARCHAR(255),
    IN p_customer_phone VARCHAR(50),
    IN p_custom_field_1 TEXT,
    IN p_custom_field_2 TEXT,
    IN p_custom_field_3 TEXT,
    IN p_custom_field_4 TEXT
)
BEGIN
    DECLARE v_reservation_id CHAR(36);
    
    -- Sukurti rezervaciją
    INSERT INTO bookings (
        calendar_id,
        start_time,
        end_time,
        customer_name,
        customer_email,
        customer_phone,
        custom_field_1,
        custom_field_2,
        custom_field_3,
        custom_field_4
    )
    VALUES (
        p_calendar_id,
        p_start_time,
        p_end_time,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_custom_field_1,
        p_custom_field_2,
        p_custom_field_3,
        p_custom_field_4
    );
    
    SET v_reservation_id = LAST_INSERT_ID();
    SELECT v_reservation_id;
END //

-- Ištrinti rezervaciją
CREATE PROCEDURE delete_reservation(IN p_reservation_id CHAR(36))
BEGIN
    DELETE FROM bookings WHERE id = p_reservation_id;
END //

DELIMITER ; 