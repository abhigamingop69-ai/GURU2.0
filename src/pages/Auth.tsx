import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Grade, Stream } from "../types";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [grade, setGrade] = useState<Grade>(11);
  const [stream, setStream] = useState<Stream>("Computer Science");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address to reset your password.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setErrorMsg("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    
    if (!isLogin && !name) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const metadata = data.user?.user_metadata || {};
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        login(data.session?.access_token || "supabase-token", {
          id: data.user?.id || "u1",
          name: metadata.full_name || "Student",
          email: data.user?.email || email,
          grade: metadata.grade || 11,
          stream: metadata.stream || "Computer Science",
          streakCount: 2,
          lastActiveDate: yesterdayStr,
          badges: [],
        });
        navigate("/welcome", { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              grade,
              stream,
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setErrorMsg("Signup successful! Please check your email to confirm your account.");
          return;
        }

        const metadata = data.user?.user_metadata || {};
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        login(data.session?.access_token || "supabase-token", {
          id: data.user?.id || "u1",
          name: metadata.full_name || name || "Student",
          email: data.user?.email || email,
          grade: metadata.grade || grade,
          stream: metadata.stream || stream,
          streakCount: 2,
          lastActiveDate: yesterdayStr,
          badges: [],
        });
        navigate("/welcome", { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col p-6 items-center justify-center overflow-y-auto overflow-x-hidden relative">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="w-full flex justify-center mb-6 relative z-10">
        <img
          src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png"
          alt="Guruba Logo"
          className="w-48 h-48 md:w-60 md:h-60 object-contain drop-shadow-md animate-float"
        />
      </div>
      <div className="w-full max-w-sm bg-card/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 space-y-6 border border-white/20 relative z-10">
        <div className="flex bg-background rounded-full p-1 relative">
          <div
            className={cn(
              "absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded-full transition-transform duration-300 z-0",
              !isLogin && "translate-x-full",
            )}
          />
          <button
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 h-10 font-bold z-10 transition-colors",
              isLogin ? "text-white" : "text-foreground/60",
            )}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 h-10 font-bold z-10 transition-colors",
              !isLogin ? "text-white" : "text-foreground/60",
            )}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground/70 uppercase">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/70 uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-foreground/70 uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-background border border-border rounded-xl px-4 pr-12 focus:outline-none focus:border-primary transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/50 hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70 uppercase">
                  Grade
                </label>
                <div className="flex gap-2">
                  {[11, 12].map((g) => (
                    <motion.button
                      key={g}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGrade(g as Grade)}
                      className={cn(
                        "flex-1 h-12 font-bold rounded-2xl transition-all border-2 border-b-4",
                        grade === g
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground/60",
                      )}
                    >
                      Grade {g}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70 uppercase">
                  Stream
                </label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value as Stream)}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Hotel Management">Hotel Management</option>
                </select>
              </div>
            </>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {errorMsg && (
            <div
              className={cn(
                "p-3 rounded-xl text-center text-sm font-semibold border",
                errorMsg.includes("successful") || errorMsg.includes("sent")
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              )}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-14 mt-6 btn-primary text-lg transition-all",
              loading ? "opacity-70 cursor-not-allowed" : "",
            )}
          >
            {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
