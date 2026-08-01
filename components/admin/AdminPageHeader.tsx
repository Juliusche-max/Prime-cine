import { ReactNode } from "react";

export default function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 md:px-8 py-6 border-b border-white/10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-bone">{title}</h1>
        {description && <p className="mt-1 text-sm text-mist max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
