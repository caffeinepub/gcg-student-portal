import { GraduationCap, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import { Button } from "../components/ui/button";
import { useTheme } from "../context/ThemeContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useInternetIdentity();
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 mb-4 glow-cyan">
              <GraduationCap size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">GCG Portal</h1>
            <p className="text-white/50 mt-1 text-sm">
              Government College Gangapur City
            </p>
          </div>

          {/* Card */}
          <div className="glass rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Sign in with Internet Identity — secure, decentralized
              authentication powered by the Internet Computer.
            </p>

            {loginError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {loginError.message}
              </div>
            )}

            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 rounded-xl glow-cyan transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />{" "}
                  Connecting...
                </>
              ) : (
                <>
                  <Shield size={18} className="mr-2" /> Login with Internet
                  Identity
                </>
              )}
            </Button>

            <p className="text-center text-xs text-white/30 mt-4">
              New user? Your account is created automatically on first login.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              ["1972", "Founded"],
              ["3000+", "Students"],
              ["50+", "Courses"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="glass rounded-xl py-3 text-center border border-white/10"
              >
                <p className="text-lg font-bold text-cyan-400">{v}</p>
                <p className="text-xs text-white/40">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
