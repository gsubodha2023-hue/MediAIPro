import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import LandingPage from "./pages/shared/LandingPage.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import BookAppointment from "./pages/patient/BookAppointment.jsx";
import MyAppointments from "./pages/patient/MyAppointments.jsx";
import MedicalRecords from "./pages/patient/MedicalRecords.jsx";
import AIAssistant from "./pages/patient/AIAssistant.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import AddPatientRecord from "./pages/doctor/AddPatientRecord.jsx";
import ReceptionDashboard from "./pages/reception/ReceptionDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { refreshAccessToken, fetchCurrentUser } from "./services/authService.js";
import { setCredentials, finishInitialLoad } from "./redux/slices/authSlice.js";
import StatusPage from "./pages/shared/StatusPage.jsx";
import CareCenter from "./pages/patient/CareCenter.jsx";
import ProfileSettings from "./pages/patient/ProfileSettings.jsx";
import About from "./pages/shared/About.jsx";
import Doctors from "./pages/shared/Doctors.jsx";
import ClinicalWorkspace from "./pages/doctor/ClinicalWorkspace.jsx";
import AdminOperations from "./pages/admin/AdminOperations.jsx";
import ReceptionOperations from "./pages/reception/ReceptionOperations.jsx";
import Notifications from "./pages/patient/Notifications.jsx";
import AccountRecovery from "./pages/auth/AccountRecovery.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";

function App() {
  const dispatch = useDispatch();

  // On first load, try to silently restore a session using the httpOnly
  // refresh-token cookie (if the user was already logged in previously).
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: refreshData } = await refreshAccessToken();
        // temporarily set token so fetchCurrentUser's interceptor can use it
        dispatch(setCredentials({ user: null, accessToken: refreshData.accessToken }));
        const { data: meData } = await fetchCurrentUser();
        dispatch(setCredentials({ user: meData.user, accessToken: refreshData.accessToken }));
      } catch {
        dispatch(finishInitialLoad());
      }
    };
    restoreSession();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<AccountRecovery />} />
      <Route path="/reset-password/:token" element={<AccountRecovery />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/doctors" element={<Doctors />} />

      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/book" element={<BookAppointment />} />
        <Route path="/patient/appointments" element={<MyAppointments />} />
        <Route path="/patient/records" element={<MedicalRecords />} />
        <Route path="/patient/ai-assistant" element={<AIAssistant />} />
        <Route path="/patient/care" element={<CareCenter />} />
        <Route path="/patient/profile" element={<ProfileSettings />} />
        <Route path="/patient/notifications" element={<Notifications />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/records/new" element={<AddPatientRecord />} />
        <Route path="/doctor/clinical" element={<ClinicalWorkspace />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["receptionist"]} />}>
        <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
        <Route path="/reception/operations" element={<ReceptionOperations />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/operations" element={<AdminOperations />} />
      </Route>

      <Route path="/unauthorized" element={<StatusPage type="unauthorized" />} />
      <Route path="*" element={<StatusPage />} />
    </Routes>
  );
}

export default App;
