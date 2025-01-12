interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-1">
        {label}
      </label>
      <input
        className={`w-full p-2 border rounded-md text-black ${className}`}
        {...props}
      />
    </div>
  );
}
