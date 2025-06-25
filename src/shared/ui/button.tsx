type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
};

export function Button({ children, variant = 'primary', onClick, className = '', type = 'button' }: ButtonProps) {
  const base = 'px-4 py-2 rounded-md font-semibold transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-600',
    secondary: 'bg-border text-foreground hover:bg-surface',
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
