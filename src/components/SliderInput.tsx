import React, { useState, useEffect } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  type: 'currency' | 'percent' | 'number' | 'years' | 'months';
  id: string;
  tooltip?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  type,
  id,
  tooltip,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    let parsed = parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
    if (isNaN(parsed)) {
      parsed = min;
    }
    // Clamp values
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
    setInputValue(clamped.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      e.currentTarget.blur();
    }
  };

  const formatDisplayValue = (val: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) return val;
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(num);
    }
    if (type === 'percent') {
      return `${num}%`;
    }
    if (type === 'years') {
      return `${num} ${num === 1 ? 'Year' : 'Years'}`;
    }
    if (type === 'months') {
      return `${num} ${num === 1 ? 'Month' : 'Months'}`;
    }
    return val;
  };

  // Convert step to ensure fine granularity if it's percent or years
  const inputStep = step;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
          title={tooltip}
        >
          {label}
        </label>
        <div className="relative flex items-center">
          {type === 'currency' && (
            <span className="absolute left-3 text-sm font-semibold text-slate-400 dark:text-slate-500">
              $
            </span>
          )}
          <input
            id={id}
            type="text"
            value={
              document.activeElement === document.getElementById(id)
                ? inputValue
                : formatDisplayValue(inputValue)
            }
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={`w-28 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-right text-sm font-bold shadow-sm transition-all outline-none dark:border-slate-800 dark:bg-slate-900/60 ${
              type === 'currency' ? 'pl-7' : ''
            } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20`}
            aria-label={`${label} input`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={inputStep}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-500 transition-all dark:bg-slate-800"
          aria-label={`${label} slider`}
        />
      </div>

      <div className="flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-600">
        <span>{formatDisplayValue(min.toString())}</span>
        <span>{formatDisplayValue(max.toString())}</span>
      </div>
    </div>
  );
};
