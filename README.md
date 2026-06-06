<div align="center">

<img src="public/calendar-logo.png" width="30%" style="position: relative; top: 0; right: 0;" alt="Project Logo"/>

# CALENDAR-RESERVATION-SYSTEM

<em></em>

<!-- BADGES -->
<!-- local repository, no metadata badges. -->

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=default&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/Resend-000000.svg?style=default&logo=Resend&logoColor=white" alt="Resend">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=default&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=default&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=default&logo=React&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=default&logo=TypeScript&logoColor=white" alt="TypeScript">
<br>
<img src="https://img.shields.io/badge/Zod-3E67B1.svg?style=default&logo=Zod&logoColor=white" alt="Zod">
<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=default&logo=ESLint&logoColor=white" alt="ESLint">
<img src="https://img.shields.io/badge/CSS-663399.svg?style=default&logo=CSS&logoColor=white" alt="CSS">
<img src="https://img.shields.io/badge/datefns-770C56.svg?style=default&logo=date-fns&logoColor=white" alt="datefns">
<img src="https://img.shields.io/badge/React%20Hook%20Form-EC5990.svg?style=default&logo=React-Hook-Form&logoColor=white" alt="React%20Hook%20Form">

</div>
<br>
A modern, full-stack calendar reservation application built with Next.js 15, TypeScript, and Supabase. This application allows users to create and manage calendars, set up booking slots, and handle reservations with email notifications.

## 🚀 Features

### Core Functionality
- **Multi-Calendar Management**: Create and manage multiple calendars with different settings
- **Flexible Booking System**: Configurable time slots, booking limits, and notice periods
- **Real-time Availability**: Dynamic time slot generation based on working hours and existing reservations
- **Email Notifications**: Automatic email confirmations for bookings using Resend
- **Admin Dashboard**: Comprehensive admin interface for managing calendars and reservations
- **Responsive Design**: Mobile-friendly interface with modern UI components

### Calendar Features
- **Working Hours**: Set custom working hours for each day of the week
- **Special Days**: Configure special dates with different working hours or closures
- **Booking Rules**: 
  - Minimum notice period (days in advance)
  - Maximum booking days ahead
  - Slot duration configuration
  - Multiple booking options
- **Custom Fields**: Up to 4 customizable fields for additional booking information

### User Experience
- **Interactive Calendar**: Visual date selection with availability indicators
- **Time Slot Selection**: Easy-to-use time slot picker with real-time availability
- **Form Validation**: Comprehensive form validation using React Hook Form and Zod
- **Dark/Light Theme**: Theme switching with system preference detection
- **Loading States**: Smooth loading animations and skeleton screens

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shad/cn** - Accessible components
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **date-fns** - Date manipulation utilities

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Real-time)
- **MySQL** - Database connectivity
- **Resend** - Email service for notifications

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast bundler for development

## 🗄️ Database Schema

The application uses a relational database with the following main entities:

- **calendars**: Main calendar information
- **calendar_settings**: Calendar configuration and rules
- **bookings**: Reservation records
- **working_hours**: Daily working hour schedules
- **special_days**: Special dates with custom hours

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Resend account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eco-akram/calendar-reservation
   cd Calendar-Reservation-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Database Setup**
   - Set up a Supabase project
   - Run the SQL schema from `@utils/supabase/Fizinis modelis.sql`
   - Configure authentication settings in Supabase

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### For Administrators
1. **Login** to the admin panel
2. **Create Calendars** with custom settings and working hours
3. **Manage Reservations** through the admin dashboard

### For End Users
1. **Browse Available Calendars** on the home page
2. **Select a Calendar** to view available dates
3. **Choose a Date** from the interactive calendar
4. **Pick a Time Slot** from available options
5. **Fill in Booking Details** and submit
6. **Receive Email Confirmation** automatically

## 🔧 Configuration

### Calendar Settings
- **Slot Duration**: Set time slot length (default: 30 minutes)
- **Booking Limits**: Configure minimum notice and maximum advance booking
- **Working Hours**: Define daily schedules
- **Special Days**: Set holidays or special working hours
- **Custom Fields**: Add up to 4 custom form fields

### Email Configuration
- Configure Resend API for email notifications
- Customize email templates in `components/email/`
- Set up email routing and delivery

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Built with ❤️ by eco.akram
