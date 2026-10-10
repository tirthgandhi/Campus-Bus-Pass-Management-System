import api from "./axios";

export const loginDriver = (data) => api.post("/login", data);
export const getProfile = () => api.get("/profile");
export const getDashboard = () => api.get("/dashboard");
export const getAssignedBus = () => api.get("/assigned-bus");
export const getAssignedRoute = () => api.get("/assigned-route");
export const getStudents = () => api.get("/students");
export const verifyPass = (passNumber) =>
  api.post("/verify-pass", { passNumber });
export const recordAttendance = (passNumber) =>
  api.post("/attendance", { passNumber });
export const getTodayAttendance = () => api.get("/attendance/today");
export const reportProblem = (data) => api.post("/report-problem", data);
export const getMyProblems = () => api.get("/problems");