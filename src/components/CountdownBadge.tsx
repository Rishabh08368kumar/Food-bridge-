import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CountdownBadgeProps {
  expiresAt: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({
  expiresAt,
  size = 'md',
  showLabel = true
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isCritical: boolean; // < 1 hour
    isUrgent: boolean; // < 3 hours
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isCritical: false,
    isUrgent: false
  });

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isCritical: true,
          isUrgent: true
        });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const isCritical = totalSeconds < 3600; // < 1 hour
      const isUrgent = totalSeconds < 10800; // < 3 hours

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isExpired: false,
        isCritical,
        isUrgent
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (timeLeft.isExpired) {
    return (
      <span
        id="badge-expired"
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-100 text-rose-800 border border-rose-200 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        <span>Expired / Check Safety</span>
      </span>
    );
  }

  if (timeLeft.isCritical) {
    return (
      <span
        id="badge-critical-expiry"
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-red-100 text-red-700 border border-red-300 animate-pulse ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
        {showLabel && <span className="font-bold">CRITICAL:</span>}
        <span className="font-mono font-bold tracking-tight">
          {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
        </span>
      </span>
    );
  }

  if (timeLeft.isUrgent) {
    return (
      <span
        id="badge-urgent-expiry"
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        {showLabel && <span>Expires in:</span>}
        <span className="font-mono font-semibold">
          {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m
        </span>
      </span>
    );
  }

  return (
    <span
      id="badge-fresh-expiry"
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      {showLabel && <span>Fresh for:</span>}
      <span className="font-mono">
        {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m
      </span>
    </span>
  );
};
