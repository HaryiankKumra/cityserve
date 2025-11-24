import { useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export function useSessionTimeout() {
  const { signOut, user } = useAuth();

  const handleLogout = useCallback(async () => {
    toast.info("Your session has expired. Please sign in again.");
    await signOut();
  }, [signOut]);

  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, SESSION_TIMEOUT);
    };

    // Activity events that reset the timer
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimeout);
    });

    // Initial timeout
    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [user, handleLogout]);
}
