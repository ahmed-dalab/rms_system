type AuthPanelProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AuthPanel({ title, description, children }: AuthPanelProps) {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-none">
      <div className="mb-5 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
