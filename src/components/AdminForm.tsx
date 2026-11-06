import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import { LucideChevronDown, LucideChevronRight, LucideLock } from "lucide-react";
import { getErrorMessage } from "../services/apiPatients";

export const patientStatusOptions = [
  { value: "NORMAL", label: "Normal" },
  { value: "NEEDS_ATTENTION", label: "Needs attention" },
  { value: "EMERGENCY", label: "Emergency" },
];

export const normalizeEnum = (v?: string) =>
  (v ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

export const toPhone = (v: string) => {
  const t = v.trim();
  return t.startsWith("+") ? t.replace(/[^\d+]/g, "") : `+234${t.replace(/\D/g, "").replace(/^0/, "")}`;
};
export const fromPhone = (v?: string) =>
  (v ?? "").replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "");

export const useLoad = <T,>(load: () => Promise<T>, deps: unknown[]) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    load()
      .then((d) => live && setData(d))
      .catch((e) => live && setError(getErrorMessage(e, "Something went wrong. Please try again.")))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
};

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export const useFields = <T extends Record<string, string>>(initial: T) => {
  const [f, setF] = useState(initial);
  const bind = (k: keyof T) => ({
    value: f[k],
    onChange: (e: ChangeEvent<Control>) => setF((p) => ({ ...p, [k]: e.target.value })),
  });
  return { f, setF, bind };
};

export const useSubmit = (run: () => Promise<void>) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await run();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save. Please try again."));
      setSaving(false);
    }
  };

  return { saving, error, onSubmit };
};

/* ---------- layout ---------- */

export const Page = ({
  crumbs,
  title,
  description,
  action,
  children,
}: {
  crumbs: { label: string; to?: string }[];
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-[#6B7C93] sm:text-[13px]">
      {crumbs.map((c, i) => (
        <span key={c.label} className="flex items-center gap-2">
          {i > 0 && <LucideChevronRight aria-hidden="true" className="size-3.5" />}
          {c.to ? (
            <Link to={c.to} className="hover:underline">
              {c.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-primary">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-[26px] font-semibold text-primary sm:text-[30px]">{title}</h1>
      {action}
    </div>
    <p className="mb-2 text-[13px] text-[#6B7C93]">{description}</p>
    {children}
  </div>
);

export const FormCard = ({
  onSubmit,
  saving,
  error,
  note,
  submitLabel,
  onCancel,
  children,
}: {
  onSubmit: (e: FormEvent) => void;
  saving: boolean;
  error: string;
  note: string;
  submitLabel: string;
  onCancel: () => void;
  children: ReactNode;
}) => (
  <form onSubmit={onSubmit} className="overflow-hidden rounded-xl border border-[#C6C6CD99] bg-white">
    {children}
    {error && (
      <p role="alert" className="mx-5 mb-4 rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#B91C1C]">
        {error}
      </p>
    )}
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C6C6CD99] bg-[#F8F9FF] px-5 py-3">
      <p className="flex items-center gap-2 text-[11px] text-[#6B7C93] sm:text-[12px]">
        <LucideLock aria-hidden="true" className="size-3.5 shrink-0" />
        {note}
      </p>
      <div className="ml-auto flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 cursor-pointer rounded-md border border-[#C6C6CD99] bg-white px-6 text-[13px] text-primary hover:bg-[#F8F9FF]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-10 cursor-pointer rounded-md bg-[#2563EB] px-5 text-[13px] font-medium text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </footer>
  </form>
);

export const Section = ({
  title,
  description,
  badge,
  cols = 3,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  cols?: 2 | 3;
  children: ReactNode;
}) => (
  <section className="border-t border-[#C6C6CD99] px-5 py-5 first:border-t-0">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-semibold text-primary">{title}</h2>
        <p className="text-[12px] text-[#6B7C93]">{description}</p>
      </div>
      {badge && (
        <span className="shrink-0 rounded-md bg-[#F1F5F9] px-3 py-1 text-[11px] text-[#6B7C93]">{badge}</span>
      )}
    </div>
    <div className={`mt-3 grid grid-cols-1 gap-x-4 gap-y-4 ${cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
      {children}
    </div>
  </section>
);

/* ---------- fields ---------- */

const inputCls =
  "h-10 w-full rounded-md border border-[#C6C6CD99] bg-white px-3 text-[13px] text-primary placeholder:text-[#9AA7B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30";

const Field = ({
  label,
  required,
  wide,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  wide?: boolean;
  children: ReactNode;
}) => (
  <label className={`flex flex-col gap-1.5 ${wide ? "md:col-span-full" : ""}`}>
    <span className="text-[12px] font-medium text-primary">
      {label}
      {required && <span className="text-[#2563EB]"> *</span>}
    </span>
    {children}
  </label>
);

type FieldProps = { label: ReactNode; wide?: boolean };

export const TextField = ({ label, wide, ...p }: InputHTMLAttributes<HTMLInputElement> & FieldProps) => (
  <Field label={label} required={p.required} wide={wide}>
    <input {...p} className={inputCls} />
  </Field>
);

export const PhoneField = ({ label, wide, ...p }: InputHTMLAttributes<HTMLInputElement> & FieldProps) => (
  <Field label={label} required={p.required} wide={wide}>
    <div className={`${inputCls} flex items-center gap-2 focus-within:ring-2 focus-within:ring-[#2563EB]/30`}>
      <span className="text-[#9AA7B8]">+234</span>
      <input
        {...p}
        type="tel"
        inputMode="tel"
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9AA7B8]"
      />
    </div>
  </Field>
);

export const SelectField = ({
  label,
  wide,
  options,
  placeholder,
  chevron = true,
  ...p
}: SelectHTMLAttributes<HTMLSelectElement> &
  FieldProps & {
    options: { value: string; label: string }[];
    placeholder?: string;
    chevron?: boolean;
  }) => {
  const value = String(p.value ?? "");
  const list = value && !options.some((o) => o.value === value) ? [...options, { value, label: value }] : options;

  return (
    <Field label={label} required={p.required} wide={wide}>
      <div className="relative">
        <select
          {...p}
          className={`${inputCls} appearance-none ${chevron ? "pr-9" : ""} ${value ? "" : "text-[#9AA7B8]"}`}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {list.map((o) => (
            <option key={o.value} value={o.value} className="text-primary">
              {o.label}
            </option>
          ))}
        </select>
        {chevron && (
          <LucideChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7C93]"
          />
        )}
      </div>
    </Field>
  );
};

export const AreaField = ({
  label,
  wide = true,
  className = "h-24",
  ...p
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) => (
  <Field label={label} required={p.required} wide={wide}>
    <textarea
      {...p}
      className={`w-full resize-none rounded-md border border-[#C6C6CD99] bg-white px-3 py-2 text-[13px] text-primary placeholder:text-[#9AA7B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${className}`}
    />
  </Field>
);

export const LoadState = ({ loading, error }: { loading: boolean; error: string }) =>
  loading ? (
    <p className="text-[13px] text-[#6B7C93]">Loading...</p>
  ) : error ? (
    <p role="alert" className="rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#B91C1C]">
      {error}
    </p>
  ) : null;