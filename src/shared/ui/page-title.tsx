type PageTitleProps = {
  children: React.ReactNode;
};

export function PageTitle({ children }: PageTitleProps) {
  return <h1 className="text-3xl font-bold text-foreground mb-6 px-4">{children}</h1>;
}
