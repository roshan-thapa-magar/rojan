"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  const parseTime = (timeString: string) => {
    if (!timeString) return { hour: 9, minute: "00", period: "AM" };
    const match = timeString.match(/^(\d{1,2}):(\d{2}) ?(AM|PM)$/i);
    if (!match) return { hour: 9, minute: "00", period: "AM" };
    return {
      hour: Number.parseInt(match[1]),
      minute: match[2],
      period: match[3].toUpperCase(),
    };
  };

  const formatTime = (hour: number, minute: string, period: string) => {
    return `${hour}:${minute} ${period}`;
  };

  const {
    hour: currentHour,
    minute: currentMinute,
    period: currentPeriod,
  } = parseTime(value || "");

  const handleTimeSelect = (hour: number, minute: string, period: string) => {
    const timeString = formatTime(hour, minute, period);
    onChange?.(timeString);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 max-w-[90vw] md:max-w-md"
        align="start"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Hours */}
          <div className="border-b sm:border-b-0 sm:border-r flex-1">
            <div className="p-2 text-sm font-medium text-center border-b sm:border-b-0 sm:border-b">
              Hour
            </div>
            <div className="max-h-40 overflow-y-auto grid grid-cols-6 sm:grid-cols-1 gap-1 p-1">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  variant={currentHour === hour ? "default" : "ghost"}
                  className="w-full justify-center text-sm h-8"
                  onClick={() =>
                    handleTimeSelect(hour, currentMinute, currentPeriod)
                  }
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="border-b sm:border-b-0 sm:border-r flex-1">
            <div className="p-2 text-sm font-medium text-center border-b sm:border-b-0 sm:border-b">
              Min
            </div>
            <div className="max-h-40 overflow-y-auto grid grid-cols-6 sm:grid-cols-1 gap-1 p-1">
              {minutes
                .filter((_, i) => i % 15 === 0)
                .map((minute) => (
                  <Button
                    key={minute}
                    variant={currentMinute === minute ? "default" : "ghost"}
                    className="w-full justify-center text-sm h-8"
                    onClick={() =>
                      handleTimeSelect(currentHour, minute, currentPeriod)
                    }
                  >
                    {minute}
                  </Button>
                ))}
            </div>
          </div>

          {/* AM/PM */}
          <div className="flex-1">
            <div className="p-2 text-sm font-medium text-center border-b sm:border-b-0 sm:border-b">
              Period
            </div>
            <div className="flex sm:flex-col justify-center gap-1 p-1">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant={currentPeriod === period ? "default" : "ghost"}
                  className="w-full justify-center text-sm h-8"
                  onClick={() =>
                    handleTimeSelect(currentHour, currentMinute, period)
                  }
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
