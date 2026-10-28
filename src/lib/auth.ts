export type UserRole = "admin" | "agente";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
}

export interface DemoAccount {
  user: User;
  password: string;
  badgeLabel: string;
  description: string;
}

export const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  agente: {
    user: {
      id: "usr-agente",
      name: "Agente de Soporte",
      email: "agente@fudo.com",
      role: "agente",
      title: "Soporte N1",
    },
    password: "123",
    badgeLabel: "Rol Agente",
    description: "Crea macros personales y solicita compartirlas para revisión.",
  },
  admin: {
    user: {
      id: "usr-admin",
      name: "Administrador Fudo",
      email: "admin@fudo.com",
      role: "admin",
      title: "Administrador General",
    },
    password: "admin",
    badgeLabel: "Rol Administrador",
    description: "Revisa, aprueba y publica macros para todo el equipo.",
  },
};

const AUTH_STORAGE_KEY = "fudo-hub-auth-user";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function authenticateUser(email: string, password?: string): { success: boolean; user?: User; error?: string } {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check exact match with demo accounts
  for (const account of Object.values(DEMO_ACCOUNTS)) {
    if (account.user.email.toLowerCase() === cleanEmail) {
      if (password && password.trim() !== account.password) {
        return { success: false, error: "Contraseña incorrecta para este usuario de prueba." };
      }
      return { success: true, user: account.user };
    }
  }

  // 2. Allow any valid email for flexible testing
  if (!cleanEmail.includes("@")) {
    return { success: false, error: "Por favor ingresa un correo electrónico válido." };
  }

  const isAdmin = cleanEmail.includes("admin");
  const fallbackUser: User = {
    id: `usr-${Date.now()}`,
    name: cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    email: cleanEmail,
    role: isAdmin ? "admin" : "agente",
    title: isAdmin ? "Administrador General" : "Agente de Soporte",
  };

  return { success: true, user: fallbackUser };
}
