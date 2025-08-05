type LabelProps = {
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

export function Label({ htmlFor, className, children }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-muted mb-1 ${className}`}>
      {children}
    </label>
  );
}
