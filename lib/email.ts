import { Resend } from 'resend';
import ReservationEmail from '@/components/email/ReservationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReservationEmail({
  to,
  reservation,
}: {
  to: string;
  reservation: {
    customer_name: string;
    start_time: Date;
    end_time: Date;
    calendar_name: string;
  };
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Rezervacijos sistema <onboarding@resend.dev>', 
      to: [to],
      subject: `Rezervacija patvirtinta: ${reservation.calendar_name}`,
      react: ReservationEmail({ reservation }),
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in sendReservationEmail:', error);
    throw error;
  }
} 