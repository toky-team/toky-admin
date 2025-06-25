type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const base = 'px-4 py-2 rounded-md font-semibold transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-600',
    secondary: 'bg-border text-foreground hover:bg-surface',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
