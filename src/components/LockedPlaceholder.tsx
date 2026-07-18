export function LockedPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={
        'bg-muted flex flex-col items-center justify-center text-muted-foreground aspect-square ' +
        className
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
      <p className="text-sm font-medium">Supporters only</p>
      <p className="text-xs mt-1">Subscribe to unlock</p>
    </div>
  );
}