import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import dayjs from "dayjs";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type FpInstance = flatpickr.Instance;

type PropsType = {
  id: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function DateTimePicker({
  id,
  label,
  placeholder,
  value,
  onChange,
}: PropsType) {
  const fpRef = useRef<FpInstance | FpInstance[] | null>(null);

  const getInstance = (): FpInstance | null => {
    if (!fpRef.current) return null;
    return Array.isArray(fpRef.current) ? fpRef.current[0] : fpRef.current;
  };

  useEffect(() => {
    fpRef.current = flatpickr(`#${id}`, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      minuteIncrement: 1,
      static: true,
      monthSelectorType: "static",
      defaultDate: value || undefined,
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          onChange?.(selectedDates[0].toISOString().replace("Z", "+00:00"));
        }
      },
    });

    return () => {
      getInstance()?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Sync external value changes (e.g. when editing an existing event)
  useEffect(() => {
    getInstance()?.setDate(value || "", false);
  }, [value]);


  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          id={id}
          placeholder={placeholder ?? "YYYY-MM-DD HH:MM"}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
