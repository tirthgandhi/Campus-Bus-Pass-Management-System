import api from "../../common/services/api.js";

function mapResponse(request, mapData) {
  return request.then((response) => ({
    ...response,
    data: {
      ...response.data,
      ...mapData(response.data.data),
    },
  }));
}

export const loginDriver = (credentials) =>
  api.post(
    "/auth/login",
    { ...credentials, role: "driver" },
    { skipAuth: true },
  );

export const getProfile = () =>
  mapResponse(
    Promise.all([
      api.get("/driver/profile"),
      api.get("/driver/bus"),
      api.get("/driver/route"),
    ]).then(([profile, bus, route]) => ({
      ...profile,
      data: {
        ...profile.data,
        data: {
          ...profile.data.data,
          assignedBus: bus.data.data,
          assignedRoute: route.data.data,
        },
      },
    })),
    (driver) => ({ driver }),
  );

export const getDashboard = () =>
  mapResponse(api.get("/driver/dashboard"), (data) => {
    const { driver, bus, route, assignedStudents, todayAttendance } = data;
    const boarded = Math.min(todayAttendance, assignedStudents);
    return {
      dashboard: {
        driverName: driver.name,
        driverId: driver.driverId,
        assignedBus: bus || {},
        assignedRoute: route
          ? {
              ...route,
              startPoint: route.startPoint,
              endPoint: route.endPoint,
            }
          : {},
        stats: {
          totalAssignedStudents: assignedStudents,
          boardedToday: boarded,
          remaining: Math.max(assignedStudents - boarded, 0),
          attendancePercentage: assignedStudents
            ? Math.round((boarded / assignedStudents) * 100)
            : 0,
        },
      },
    };
  });

export const getAssignedBus = () =>
  mapResponse(api.get("/driver/bus"), (bus) => ({ bus }));

export const getAssignedRoute = () =>
  mapResponse(api.get("/driver/route"), (route) => ({
    route: route
      ? {
          ...route,
          routeNumber: route.routeCode,
          stops: (route.pickupPoints || []).map((point, index) => ({
            ...point,
            sequence: point.sequence ?? index + 1,
          })),
        }
      : null,
  }));

export const getStudents = () =>
  mapResponse(api.get("/driver/students"), (assignments) => ({
    students: assignments.map(({ student, busPassId, _id }) => ({
      ...student,
      assignmentId: _id,
      busPassId,
      status: "Pending",
    })),
  }));

export const verifyPass = (busPassId) =>
  mapResponse(api.post("/driver/verify-bus-pass", { busPassId }), (assignment) => ({
    student: {
      ...assignment.student,
      busPassId: assignment.busPassId,
      status: assignment.student.transportStatus,
    },
  }));

export const recordAttendance = (busPassId) =>
  mapResponse(api.post("/driver/attendance", { busPassId }), (attendance) => ({
    attendance,
  }));

export const getTodayAttendance = () =>
  Promise.all([
    api.get("/driver/attendance/today"),
    api.get("/driver/dashboard"),
  ]).then(([attendanceResponse, dashboardResponse]) => {
    const attendance = attendanceResponse.data.data;
    const assigned = dashboardResponse.data.data.assignedStudents;
    const boarded = attendance.filter((record) => record.status === "present");
    return {
      ...attendanceResponse,
      data: {
        ...attendanceResponse.data,
        summary: {
          totalAssigned: assigned,
          boarded: boarded.length,
          remaining: Math.max(assigned - boarded.length, 0),
          attendancePercentage: assigned
            ? Math.round((boarded.length / assigned) * 100)
            : 0,
        },
        students: attendance.map((record) => ({
          studentId: record.student?._id || record.student,
          name: record.student?.name || "Unknown student",
          busPassId: record.busPassId,
          time: record.boardingTime,
          status: record.status === "present" ? "Boarded" : "Pending",
        })),
      },
    };
  });

export const reportProblem = (data) =>
  api.post("/driver/report-problem", data);

export const getMyProblems = () => api.get("/driver/problems");
