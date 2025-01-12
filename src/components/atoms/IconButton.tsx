interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  active?: boolean;
  variant?: 'primary' | 'secondary' | 'warning';
}

export function IconButton({ 
  icon, 
  active = false, 
  variant = 'primary',
  className = '', 
  ...props 
}: IconButtonProps) {
  const baseClasses = 'p-2 rounded-full transition-colors';
  const variantClasses = {
    primary: `${active ? 'bg-blue-200' : ''} hover:bg-blue-100`,
    secondary: `${active ? 'bg-gray-200' : ''} hover:bg-gray-100`,
    warning: `${active ? 'bg-yellow-200' : ''} hover:bg-yellow-100`,
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className={active ? 'text-blue-500' : ''}>{icon}</span>
    </button>
  );
}
