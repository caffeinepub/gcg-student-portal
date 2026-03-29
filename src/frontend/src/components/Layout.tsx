import { type ReactNode, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import AnimatedBackground from "./AnimatedBackground";
import Header from "./Header";
import OfflineBanner from "./OfflineBanner";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <AnimatedBackground />
      <OfflineBanner />
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen((o) => !o)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="animate-fade-in max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
