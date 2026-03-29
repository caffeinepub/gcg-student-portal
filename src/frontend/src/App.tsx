import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CalendarPage from "./pages/CalendarPage";
import ChatPage from "./pages/ChatPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SetupProfilePage from "./pages/SetupProfilePage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import SubjectsPage from "./pages/SubjectsPage";

function AppRoutes() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!identity || !actor) return;
    actor
      .getCallerProfile()
      .then((p) => {
        setHasProfile(!!p);
        setProfileChecked(true);
      })
      .catch(() => {
        setHasProfile(false);
        setProfileChecked(true);
      });
  }, [identity, actor]);

  if (isInitializing) {
    return (
      <div className={`${theme} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  if (identity && !profileChecked) {
    return (
      <div className={`${theme} min-h-screen flex items-center justify-center`}>
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className={theme}>
        <Routes>
          <Route
            path="*"
            element={
              <SetupProfilePage
                onComplete={() => {
                  setHasProfile(true);
                }}
              />
            }
          />
        </Routes>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:id" element={<SubjectDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(10, 20, 40, 0.9)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              color: "#fff",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}
