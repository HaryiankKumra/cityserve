import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSessionTimeout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);

      // Warn at 14 minutes
      warningId = setTimeout(() => {
        toast.warning(
          "Your session will expire in 1 minute due to inactivity",
          {
            duration: 60000,
          }
        );
      }, 14 * 60 * 1000);

      // Logout at 15 minutes
      timeoutId = setTimeout(() => {
        signOut();
        navigate("/auth");
        toast.error("Session expired due to inactivity");
      }, 15 * 60 * 1000);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => document.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, [user, signOut, navigate]);
}
