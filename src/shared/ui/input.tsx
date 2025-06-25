type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  return (
    <input
      className="w-full bg-surface border border-border text-foreground px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-primary"
      {...props}
    />
  );
}
