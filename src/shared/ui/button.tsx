type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  size = 'md',
}: ButtonProps) {
  const base = 'px-4 py-2 rounded-md font-semibold transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-600',
    secondary: 'bg-border text-foreground hover:bg-surface',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-border text-foreground hover:bg-surface',
  };
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
