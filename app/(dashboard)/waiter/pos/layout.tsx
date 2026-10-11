/** Full-bleed POS layout inside the waiter shell */
export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-6 flex min-h-[calc(100svh-3.5rem)] flex-col overflow-hidden">
      {children}
    </div>
  );
}
