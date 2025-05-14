import { getCalendarById } from "@/lib/actions";

export default async function CalendarPage({ params }: { params: { id: string } }) {
  const calendar = await getCalendarById(params.id);

  if (!calendar) {
    return <div className="p-4 text-red-500">Calendar not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{calendar.name}</h1>
      {calendar.description && <p className="mb-2">{calendar.description}</p>}
      {calendar.settings && calendar.settings.length > 0 && (
        <div className="text-sm text-gray-500">
          {calendar.settings.map((setting, index) => (
            <div key={index} className="mb-2">
              <p>Slot duration: {setting.slot_duration_minutes} minutes</p>
              <p>
                Multiple bookings:{" "}
                {setting.allow_multiple_bookings ? "Allowed" : "Not allowed"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}