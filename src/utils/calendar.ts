export function downloadICal(event: {
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO string or date
  durationHours?: number;
}) {
  const start = new Date(event.startDate);
  const end = new Date(start.getTime() + (event.durationHours || 1) * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IresoJ Digital CSC//Repair Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Appointment.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
