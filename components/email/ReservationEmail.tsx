import * as React from 'react';

interface ReservationEmailProps {
  reservation: {
    customer_name: string;
    start_time: Date;
    end_time: Date;
    calendar_name: string;
  };
}

export const ReservationEmail = ({
  reservation,
}: ReservationEmailProps) => {

  return (
    <div style={main}>
      <div style={container}>
        <div style={header}>
          <h1 style={h1}>Rezervacija patvirtinta</h1>
        </div>
        
        <div style={section}>
          <p style={text}>
            Sveiki, <strong>{reservation.customer_name}</strong>!
          </p>
          
          <div style={infoBox}>
            <h2 style={h2}>Rezervacijos informacija</h2>
            <div style={infoRow}>
              <span style={label}>Kalendorius:</span>
              <span style={value}>{reservation.calendar_name}</span>
            </div>
            <div style={infoRow}>
              <span style={label}>Data:</span>
              <span style={value}>
                {reservation.start_time.toLocaleDateString('lt-LT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div style={infoRow}>
              <span style={label}>Laikas:</span>
              <span style={value}>
                {reservation.start_time.toLocaleTimeString('lt-LT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} - {reservation.end_time.toLocaleTimeString('lt-LT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div style={noteBox}>
            <p style={noteText}>
              <strong>Svarbu:</strong> Jei negalite atvykti, prašome pranešti kuo anksčiau.
            </p>
          </div>

          <p style={text}>
            Jei turite klausimų, susisiekite su mumis el. paštu arba telefonu.
          </p>
        </div>

        <div style={footer}>
          <p style={footerText}>
            Šis laiškas buvo išsiųstas automatiškai. Prašome neatsakyti į jį.
          </p>
        </div>
      </div>
    </div>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  padding: '20px 0',
};

const container = {
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const header = {
  padding: '24px 32px',
  backgroundColor: '#2563eb',
  borderRadius: '8px 8px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
};

const section = {
  padding: '32px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
};

const infoRow = {
  display: 'flex' as const,
  marginBottom: '12px',
  alignItems: 'center' as const,
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  width: '80px',
  flexShrink: 0,
};

const value = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
};

const noteBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const noteText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
};

const footer = {
  padding: '24px 32px',
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
};

export default ReservationEmail;