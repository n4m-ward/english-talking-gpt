interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-1">
        {label}
      </label>
      <select
        className={`w-full p-2 border rounded-md text-black ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
