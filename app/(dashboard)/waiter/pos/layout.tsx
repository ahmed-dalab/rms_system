/** POS fills the viewport below the 3.5rem waiter header on large screens */
export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100svh-3.5rem)] lg:overflow-hidden">
      {children}
    </div>
  );
}
