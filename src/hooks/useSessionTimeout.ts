import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSessionTimeout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const warningIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 29 * 60 * 1000; // 29 minutes

    const resetTimer = () => {
      // Clear existing timers
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (warningIdRef.current) clearTimeout(warningIdRef.current);

      // Show warning 1 minute before logout
      warningIdRef.current = setTimeout(() => {
        toast.warning("Your session will expire in 1 minute due to inactivity", {
          duration: 60000,
        });
      }, WARNING_TIME);

      // Logout after 30 minutes of inactivity
      timeoutIdRef.current = setTimeout(async () => {
        await signOut();
        navigate("/auth");
        toast.error("Session expired due to inactivity");
      }, INACTIVE_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (warningIdRef.current) clearTimeout(warningIdRef.current);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, [user, signOut, navigate]);
}
