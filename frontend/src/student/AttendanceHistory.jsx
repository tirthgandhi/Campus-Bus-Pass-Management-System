import React from "react";

const attendanceRecords = [
  {
    date: "18 September 2026",
    bus: "GJ-01-BU-2145",
    route: "North Campus Express",
    status: "Present"
  },
  {
    date: "17 September 2026",
    bus: "GJ-01-BU-2145",
    route: "North Campus Express",
    status: "Present"
  },
  {
    date: "16 September 2026",
    bus: "GJ-01-BU-2145",
    route: "North Campus Express",
    status: "Absent"
  },
  {
    date: "15 September 2026",
    bus: "GJ-01-BU-2145",
    route: "North Campus Express",
    status: "Present"
  }
];

export default function AttendanceHistory() {
  const presentCount = attendanceRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const attendancePercentage = Math.round(
    (presentCount / attendanceRecords.length) * 100
  );

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>Attendance History</h1>
      <p className="muted">
        View your bus attendance recorded by the driver.
      </p>

      <section className="cards attendance-summary">
        <div className="card">
          <div className="card-icon">✓</div>
          <p>Total Present</p>
          <h3>{presentCount}</h3>
        </div>

        <div className="card">
          <div className="card-icon">×</div>
          <p>Total Absent</p>
          <h3>{attendanceRecords.length - presentCount}</h3>
        </div>

        <div className="card">
          <div className="card-icon">%</div>
          <p>Attendance Rate</p>
          <h3>{attendancePercentage}%</h3>
        </div>
      </section>

      <div className="panel attendance-panel">
        <h2>Attendance Records</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bus Number</th>
                <th>Route</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.date}>
                  <td>{record.date}</td>
                  <td>{record.bus}</td>
                  <td>{record.route}</td>
                  <td>
                    <span
                      className={
                        record.status === "Present"
                          ? "attendance-status present"
                          : "attendance-status absent"
                      }
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}