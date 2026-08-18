import React, { useState, useEffect, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  subDays,
} from "date-fns";
import {
  TodayOutlined as TodayIcon,
  CalendarTodayOutlined as YesterdayIcon,
  DateRangeOutlined as Last7DaysIcon,
  CalendarViewWeekOutlined as ThisWeekIcon,
  CalendarMonthOutlined as ThisMonthIcon,
  ArrowBackIosOutlined as LastMonthIcon,
  AccountBalanceOutlined as FiscalYearIcon,
  TuneOutlined as CustomIcon,
  ChevronLeftOutlined as ChevronLeft,
  ChevronRightOutlined as ChevronRight,
  CalendarMonthOutlined,
  CloseOutlined as Close,
} from "@mui/icons-material";
import { Button, InputAdornment, TextField } from "@mui/material";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export type PresetOption =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "last7days"
  | "thisMonth"
  | "lastMonth"
  | "currentFY"
  | "custom";

interface DateRangePickerProps {
  onDateRangeChange: (range: DateRange) => void;
  initialRange?: DateRange;
  minDate?: Date;
  maxDate?: Date;
  fiscalYearStartMonth?: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateRangeChange,
  initialRange = { startDate: null, endDate: null },
  minDate,
  maxDate,
  fiscalYearStartMonth = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<PresetOption | null>(null);
  const [pendingRange, setPendingRange] = useState<DateRange>(initialRange);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedRange(initialRange);
    setPendingRange(initialRange);
    setTempEndDate(null);
    setActivePreset(null);
    setCurrentMonth(initialRange.startDate || new Date());
  }, [
    initialRange.endDate?.getTime(),
    initialRange.startDate?.getTime(),
  ]);

  const getCurrentFiscalYear = (): DateRange => {
    const today = new Date();
    let fiscalYearStart: Date;
    let fiscalYearEnd: Date;

    if (today.getMonth() >= fiscalYearStartMonth) {
      fiscalYearStart = new Date(today.getFullYear(), fiscalYearStartMonth, 1);
      fiscalYearEnd = new Date(
        today.getFullYear() + 1,
        fiscalYearStartMonth,
        0
      );
    } else {
      fiscalYearStart = new Date(
        today.getFullYear() - 1,
        fiscalYearStartMonth,
        1
      );
      fiscalYearEnd = new Date(today.getFullYear(), fiscalYearStartMonth, 0);
    }

    return { startDate: fiscalYearStart, endDate: fiscalYearEnd };
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    const firstDayOfMonth = start.getDay();
    const emptyCells = Array(firstDayOfMonth).fill(null);
    return [...emptyCells, ...days];
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const applyPreset = (presetId: PresetOption) => {
    const today = new Date();
    let range: DateRange;

    switch (presetId) {
      case "today":
        range = { startDate: today, endDate: today };
        break;
      case "yesterday":
        range = { startDate: subDays(today, 1), endDate: subDays(today, 1) };
        break;
      case "thisWeek":
        range = {
          startDate: startOfWeek(today, { weekStartsOn: 1 }),
          endDate: endOfWeek(today, { weekStartsOn: 1 }),
        };
        break;
      case "last7days":
        range = { startDate: subDays(today, 6), endDate: today };
        break;
      case "thisMonth":
        range = { startDate: startOfMonth(today), endDate: endOfMonth(today) };
        break;
      case "lastMonth": {
        const lastMonth = subMonths(today, 1);
        range = {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
        break;
      }
      case "currentFY":
        range = getCurrentFiscalYear();
        break;
      case "custom":
        setActivePreset("custom");
        return;
      default:
        range = { startDate: today, endDate: today };
    }

    setSelectedRange(range);
    setPendingRange(range);
    setActivePreset(presetId);
    setCurrentMonth(range.startDate || today);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    let newRange: DateRange;

    if (
      !pendingRange.startDate ||
      (pendingRange.startDate && pendingRange.endDate)
    ) {
      newRange = { startDate: newDate, endDate: null };
    } else if (pendingRange.startDate && !pendingRange.endDate) {
      let start = pendingRange.startDate;
      let end = newDate;

      const normalizeDate = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const normalizedStart = normalizeDate(start);
      const normalizedEnd = normalizeDate(end);

      if (normalizedEnd.getTime() < normalizedStart.getTime()) {
        [start, end] = [end, start];
      }

      newRange = { startDate: start, endDate: end };
    } else {
      newRange = { startDate: newDate, endDate: null };
    }

    setPendingRange(newRange);
    setTempEndDate(null);
    setActivePreset("custom");
  };

  // FIXED: Use pendingRange instead of selectedRange
  const handleMouseEnter = (date: Date) => {
    if (
      pendingRange.startDate &&
      !pendingRange.endDate &&
      activePreset === "custom"
    ) {
      setTempEndDate(date);
    }
  };

  const clearSelection = () => {
    const newRange: DateRange = { startDate: null, endDate: null };
    setSelectedRange(newRange);
    setPendingRange(newRange);
    setTempEndDate(null);
    setActivePreset(null);
    onDateRangeChange(newRange);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);

    // Also select today's date
    const todayRange: DateRange = {
      startDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    };
    setPendingRange(todayRange);
    setActivePreset("today");
  };

  // FIXED: Use pendingRange instead of selectedRange
  const isDateInRange = (date: Date): boolean => {
    if (activePreset !== "custom" && pendingRange.startDate && tempEndDate)
      return false;

    const start = pendingRange.startDate;
    const end = tempEndDate || pendingRange.endDate;

    if (!start || !end) return false;

    const normalizeDate = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const normalizedDate = normalizeDate(date);
    const normalizedStart = normalizeDate(start);
    const normalizedEnd = normalizeDate(end);

    return (
      (normalizedDate.getTime() > normalizedStart.getTime() &&
        normalizedDate.getTime() < normalizedEnd.getTime()) ||
      normalizedDate.getTime() === normalizedStart.getTime() ||
      normalizedDate.getTime() === normalizedEnd.getTime()
    );
  };

  const getDisplayText = () => {
    const formatDisplayDate = (date: Date) => format(date, "dd/MM/yyyy");

    if (selectedRange.startDate && selectedRange.endDate) {
      return `${formatDisplayDate(selectedRange.startDate)} - ${formatDisplayDate(selectedRange.endDate)}`;
    }

    if (pendingRange.startDate && pendingRange.endDate) {
      return `${formatDisplayDate(pendingRange.startDate)} - ${formatDisplayDate(pendingRange.endDate)}`;
    }

    if (pendingRange.startDate) {
      return `${formatDisplayDate(pendingRange.startDate)} - End date`;
    }

    return "";
  };

  const applyPendingRange = () => {
    if (pendingRange.startDate && pendingRange.endDate) {
      const normalizeDate = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };

      const normalizedRange = {
        startDate: normalizeDate(pendingRange.startDate),
        endDate: normalizeDate(pendingRange.endDate),
      };

      setSelectedRange(normalizedRange);
      onDateRangeChange(normalizedRange);
      setIsOpen(false);
    }
  };

  const renderCalendar = (month: Date) => {
    const days = getDaysInMonth(month);
    const monthName = format(month, "MMM yyyy");

    return (
      <div className="w-56">
        <div className="px-3 py-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-800">{monthName}</h3>
        </div>

        <div className="grid grid-cols-7 mb-1 px-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="text-xs text-gray-500 text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 px-2">
          {days.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-7 w-7 flex items-center justify-center text-xs"
                />
              );
            }
            const isCurrentMonthDay = isSameMonth(day, month);
            const isTodayDate = isToday(day);

            // FIXED: Use pendingRange for selection highlighting
            const isSelectedStart =
              pendingRange.startDate && isSameDay(day, pendingRange.startDate);
            const isSelectedEnd =
              pendingRange.endDate && isSameDay(day, pendingRange.endDate);
            const isSelected = isSelectedStart || isSelectedEnd;

            const inRange = isDateInRange(day);
            const isDisabled = isDateDisabled(day);

            const getBackground = () => {
              if (isSelected) return "bg-blue-600";
              if (inRange) return "bg-gradient-to-r from-blue-50 to-blue-100";
              if (isTodayDate) return "bg-blue-50 border border-blue-200";
              return "";
            };

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                disabled={isDisabled}
                className={`
                  h-7 w-7 flex items-center justify-center text-xs rounded
                  transition-all duration-200
                  ${isDisabled ? "text-gray-300 cursor-not-allowed" : ""}
                  ${!isCurrentMonthDay && !isDisabled ? "text-gray-400" : ""}
                  ${!isDisabled && !isSelected && !inRange && isCurrentMonthDay
                    ? "text-gray-700 hover:bg-gray-100"
                    : ""
                  }
                  ${getBackground()}
                  ${isSelected ? "text-white shadow-sm" : ""}
                  ${isSelectedStart ? "rounded-r-none" : ""}
                  ${isSelectedEnd ? "rounded-l-none" : ""}
                  ${inRange && !isSelectedStart && !isSelectedEnd
                    ? "rounded-none"
                    : ""
                  }
                  ${isTodayDate && !isSelected ? "font-semibold" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const presetOptions = [
    {
      id: "today" as PresetOption,
      label: "Today",
      icon: <TodayIcon className="w-4 h-4" />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "yesterday" as PresetOption,
      label: "Yesterday",
      icon: <YesterdayIcon className="w-4 h-4" />,
      color: "bg-green-50 text-green-600",
    },
    {
      id: "thisWeek" as PresetOption,
      label: "This Week",
      icon: <ThisWeekIcon className="w-4 h-4" />,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      id: "last7days" as PresetOption,
      label: "Last 7 Days",
      icon: <Last7DaysIcon className="w-4 h-4" />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "thisMonth" as PresetOption,
      label: "This Month",
      icon: <ThisMonthIcon className="w-4 h-4" />,
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: "lastMonth" as PresetOption,
      label: "Last Month",
      icon: <LastMonthIcon className="w-4 h-4" />,
      color: "bg-red-50 text-red-600",
    },
    {
      id: "currentFY" as PresetOption,
      label: "Current FY",
      icon: <FiscalYearIcon className="w-4 h-4" />,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "custom" as PresetOption,
      label: "Custom Range",
      icon: <CustomIcon className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-700",
    },
  ];

  return (
    <div className="relative" ref={pickerRef}>
      <TextField
        fullWidth
        size="small"
        value={getDisplayText()}
        placeholder="Select date range"
        onClick={() => setIsOpen(!isOpen)}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonthOutlined
                  fontSize="small"
                  color={isOpen ? "primary" : "action"}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <span className="text-[11px] font-medium text-gray-400">Pick</span>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            cursor: "pointer",
            backgroundColor: isOpen ? "rgba(243, 116, 64, 0.04)" : "background.paper",
          },
          "& .MuiOutlinedInput-input": {
            cursor: "pointer",
          },
        }}
      />

      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 bg-white rounded shadow-2xl border border-gray-200 p-2 w-[750px] right-0">
          <div className="flex gap-3">
            <div className="w-48">
              <div className="space-y-0.5">
                {presetOptions.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded
                        transition-all duration-150 text-left
                        ${activePreset === preset.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                      }
                    `}
                  >
                    <div
                      className={`p-1 rounded ${activePreset === preset.id ? "bg-white" : preset.color
                        }`}
                    >
                      {preset.icon}
                    </div>
                    <span
                      className={`text-xs font-medium ${activePreset === preset.id
                          ? "text-blue-700"
                          : "text-gray-700"
                        }`}
                    >
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Close className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-gradient-to-b from-white to-gray-50 rounded p-2 border border-gray-100">
                  {renderCalendar(currentMonth)}
                </div>

                <div className="bg-gradient-to-b from-white to-gray-50 rounded p-2 border border-gray-100">
                  {renderCalendar(addMonths(currentMonth, 1))}
                </div>
              </div>

              {pendingRange.startDate && pendingRange.endDate && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="contained"
                    onClick={applyPendingRange}
                    size="small"
                    sx={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                      },
                      textTransform: "none",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    Apply Date Range
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
