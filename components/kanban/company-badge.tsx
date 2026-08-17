"use client";

const COMPANY_COLORS: Record<string, string> = {
  Google: "#ea4335",
  Stripe: "#635bff",
  Linear: "#5e6ad2",
  Vercel: "#ffffff",
  Figma: "#f24e1e",
  Notion: "#ffffff",
  Supabase: "#3ecf8e",
  Meta: "#0866ff",
};

export function CompanyBadge({ company }: { company: string }) {
  const color = COMPANY_COLORS[company] ?? "#6642c7";
  const isLight = color === "#ffffff";
  const initials = company.slice(0, 2).toUpperCase();

  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold"
      style={{
        backgroundColor: color,
        color: isLight ? "#111010" : "#ffffff",
      }}
    >
      {initials}
    </span>
  );
}