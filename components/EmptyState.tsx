"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
      <p className="text-tg-text font-medium text-[15px]">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-tg-hint max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
