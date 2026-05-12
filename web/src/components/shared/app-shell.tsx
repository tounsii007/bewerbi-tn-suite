"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookmarkPlus,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Heart,
  Home,
  LogOut,
  Plane,
  Search,
  Settings,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: "APPLICANT" | "EMPLOYER" | "ADMIN";
}

const APPLICANT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Übersicht", icon: Home },
  { href: "/search", label: "Suche", icon: Search },
  { href: "/applications", label: "Bewerbungen", icon: FileText },
  { href: "/favorites", label: "Favoriten", icon: Heart },
  { href: "/saved-searches", label: "Suchabos", icon: BookmarkPlus },
];

const APPLICANT_TOOLS: NavItem[] = [
  { href: "/anerkennung", label: "Anerkennung", icon: GraduationCap },
  { href: "/visa", label: "Visum", icon: Plane },
  { href: "/cv-upload", label: "CV hochladen", icon: Upload },
  { href: "/profile", label: "Profil", icon: User },
];

const EMPLOYER_NAV: NavItem[] = [
  { href: "/employer/dashboard", label: "Übersicht", icon: Home },
  { href: "/employer/listings", label: "Stellenanzeigen", icon: Briefcase },
  { href: "/employer/company", label: "Firmenprofil", icon: Building2 },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/users", label: "Benutzer", icon: User },
  { href: "/admin/companies", label: "Unternehmen", icon: Building2 },
  { href: "/admin/reports", label: "Berichte", icon: FileText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const pathname = usePathname();

  const nav = user?.role === "EMPLOYER" ? EMPLOYER_NAV : user?.role === "ADMIN" ? ADMIN_NAV : APPLICANT_NAV;
  const tools = user?.role === "APPLICANT" ? APPLICANT_TOOLS : [];

  return (
    <div className="flex min-h-dvh bg-surface-alt dark:bg-dark-bg">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 border-e border-gray-100 bg-white md:block dark:border-dark-border dark:bg-dark-card">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-primary-700 dark:text-primary-300">
            bewerbi<span className="text-accent-500">.</span>tn
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-4">
          <SectionLabel>Navigation</SectionLabel>
          {nav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} />
          ))}

          {tools.length > 0 && (
            <>
              <SectionLabel className="mt-5">Tools</SectionLabel>
              {tools.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} />
              ))}
            </>
          )}

          <SectionLabel className="mt-5">Account</SectionLabel>
          <NavLink item={{ href: "/settings", label: "Einstellungen", icon: Settings }} active={pathname === "/settings"} />
          <button
            onClick={() => void signOut()}
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-bg"
          >
            <LogOut className="size-4" /> Abmelden
          </button>
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/80 px-4 backdrop-blur md:px-8 dark:border-dark-border dark:bg-dark-card/80">
          <Link href="/dashboard" className="md:hidden text-lg font-extrabold tracking-tight text-primary-700 dark:text-primary-300">
            bewerbi<span className="text-accent-500">.</span>tn
          </Link>
          <div className="ms-auto flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="relative flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-border dark:text-dark-text"
              aria-label="Benachrichtigungen"
            >
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-accent-500" />
            </button>
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="" alt={user?.email ?? "Profil"} />
                <AvatarFallback>
                  {user?.email?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-20 flex border-t border-gray-100 bg-white md:hidden dark:border-dark-border dark:bg-dark-card">
          {[...nav.slice(0, 4), { href: "/profile", label: "Profil", icon: User }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[11px]",
                pathname === item.href
                  ? "text-primary-600 dark:text-primary-300"
                  : "text-gray-500 dark:text-dark-muted",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
          : "text-gray-600 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-bg",
      )}
    >
      <Icon className="size-4" /> {item.label}
    </Link>
  );
}

function SectionLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-dark-muted", className)}>
      {children}
    </div>
  );
}
