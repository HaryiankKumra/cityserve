import { useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const THROTTLE_DELAY = 5000; // Only reset timeout every 5 seconds

export function useSessionTimeout() {
  const { signOut, user } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const handleLogout = useCallback(async () => {
    toast.info("Your session has expired. Please sign in again.");
    await signOut();
  }, [signOut]);

  useEffect(() => {
    if (!user) return;

    const resetTimeout = () => {
      const now = Date.now();
      
      // Throttle: only reset if enough time has passed since last activity
      if (now - lastActivityRef.current < THROTTLE_DELAY) {
        return;
      }
      
      lastActivityRef.current = now;
      
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(handleLogout, SESSION_TIMEOUT);
    };

    // Reduce to fewer, more meaningful events
    const events = ["mousedown", "keydown"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, { passive: true });
    });

    // Initial timeout
    resetTimeout();

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [user, handleLogout]);
}
