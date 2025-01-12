interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white p-8 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
}
