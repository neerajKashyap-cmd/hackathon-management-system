import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CountdownTimer({ targetDate, label = "Deadline" }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className="timer-badge expired">
        <Clock className="timer-icon" />
        <span>Registration Closed</span>
      </div>
    );
  }

  return (
    <div className="timer-badge active">
      <Clock className="timer-icon" />
      <span className="timer-label">{label}:</span>
      <div className="timer-digits">
        <span className="digit-unit">{timeLeft.days}d</span>
        <span className="digit-colon">:</span>
        <span className="digit-unit">{timeLeft.hours.toString().padStart(2, "0")}h</span>
        <span className="digit-colon">:</span>
        <span className="digit-unit">{timeLeft.minutes.toString().padStart(2, "0")}m</span>
        <span className="digit-colon">:</span>
        <span className="digit-unit">{timeLeft.seconds.toString().padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
