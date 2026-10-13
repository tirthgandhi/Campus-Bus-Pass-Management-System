import { jsPDF } from 'jspdf';
import { summarizeAttendance } from './attendanceService.js';

function displayDate(value) {
  const dateText = typeof value === 'string' ? value.slice(0, 10) : '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!match) return 'Unknown date';
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString();
}

function text(value, fallback = 'N/A') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function downloadAttendanceReport(records, filters) {
  const document = new jsPDF({ orientation: 'landscape' });
  const summary = summarizeAttendance(records);
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const left = 12;
  const columns = [
    { x: 12, width: 39, title: 'Student', value: (record) => text(record.student) },
    { x: 54, width: 26, title: 'Enrollment', value: (record) => text(record.enrollmentNumber) },
    { x: 82, width: 26, title: 'Pass ID', value: (record) => text(record.busPassId) },
    { x: 110, width: 22, title: 'Bus', value: (record) => text(record.bus) },
    { x: 134, width: 43, title: 'Route', value: (record) => text(record.route) },
    { x: 179, width: 32, title: 'Driver', value: (record) => text(record.driver) },
    { x: 213, width: 25, title: 'Date', value: (record) => displayDate(record.date) },
    { x: 240, width: 22, title: 'Status', value: (record) => text(record.status, 'Unknown').toUpperCase() },
    { x: 264, width: 21, title: 'Rate', value: (record) => `${record.attendanceRate}%` },
  ];

  const drawTableHeader = (y) => {
    document.setFont('helvetica', 'bold');
    document.setFontSize(8);
    columns.forEach((column) => document.text(column.title, column.x, y));
    document.line(left, y + 3, pageWidth - left, y + 3);
    document.setFont('helvetica', 'normal');
    return y + 10;
  };

  document.setFont('helvetica', 'bold');
  document.setFontSize(18);
  document.text('Student Attendance Report', left, 18);
  document.setFont('helvetica', 'normal');
  document.setFontSize(10);
  document.text(`Date: ${filters.date || 'All dates'}  |  Bus: ${filters.bus}  |  Route: ${filters.route}`, left, 27);
  document.text(
    `Filtered records: ${records.length}  |  Present: ${summary.present}  |  Absent: ${summary.absent}  |  Filtered rate: ${summary.percentage}%`,
    left,
    34,
  );
  document.setFontSize(8);

  let y = drawTableHeader(43);
  for (const record of records) {
    const cells = columns.map((column) => document.splitTextToSize(column.value(record), column.width));
    const rowHeight = Math.max(8, ...cells.map((lines) => lines.length * 4 + 2));
    if (y + rowHeight > pageHeight - 12) {
      document.addPage();
      y = drawTableHeader(16);
    }
    cells.forEach((lines, index) => document.text(lines, columns[index].x, y));
    y += rowHeight;
  }

  document.save('student-attendance-report.pdf');
}
