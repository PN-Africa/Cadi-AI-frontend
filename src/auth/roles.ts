
const normalize = (role?: string | null) =>
  (role ?? "").toLowerCase().replace(/[_\s-]+/g, " ").trim();

export const isAdminRole = (role?: string | null) => normalize(role).includes("admin");

export const isHealthcareRole = (role?: string | null) =>
  normalize(role) === "healthcare professional";