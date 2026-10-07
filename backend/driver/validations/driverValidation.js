const { fail, text, day } = require('../../common/utils/http');

const busPassId = value => text(value, 'Bus Pass ID', { max: 100 });

function attendanceDetails(body) {
  const date = day();
  if (body.date && day(body.date).getTime() !== date.getTime()) fail(400, 'Attendance can only be marked for today.');
  const status = body.status || 'present';
  if (!['present', 'absent'].includes(status)) fail(400, 'Choose present or absent.');
  return { date, status };
}

module.exports = { busPassId, attendanceDetails };
