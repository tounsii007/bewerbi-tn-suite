"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Lightweight ⌘K / Ctrl+K palette. Keep the surface area small — full-text search and
 * keyboard navigation; deep features go to dedicated pages. The home for "I want to go
 * somewhere fast" interactions.
 *
 * Pure client component. No keyboard library dependency — Tab/Arrow handling is small enough
 * to own. The result list is virtualised only if it gets bigger than ~40 entries (not now).
 */
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  /** Lucide icon component or any node. */
  icon?: React.ReactNode;
  /** When set, palette navigates here on select. */
  href?: string;
  /** When set, invoked instead of navigating. */
  onSelect?: () => void;
  /** Free-text matched against in addition to {@code label}. */
  keywords?: string[];
  /** Group label. Items with the same {@code group} appear under one heading. */
  group?: string;
}

export interface CommandPaletteProps {
  items: CommandItem[];
  /** Override default Cmd/Ctrl+K binding. */
  hotkey?: string;
  placeholder?: string;
}

export function CommandPalette({
  items,
  hotkey = "k",
  placeholder = "Suchen oder Befehl ausführen…",
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === hotkey.toLowerCase()) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey]);

  // Reset query when closed.
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const hay = [i.label, i.description, ...(i.keywords ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const g = item.group ?? "";
      const arr = map.get(g) ?? [];
      arr.push(item);
      map.set(g, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function activate(item: CommandItem) {
    setOpen(false);
    if (item.onSelect) item.onSelect();
    else if (item.href) router.push(item.href);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[20%] z-50 w-[92vw] max-w-xl -translate-x-1/2",
            "rounded-2xl border border-gray-100 bg-white shadow-2xl",
            "dark:border-dark-border dark:bg-dark-card",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          )}
        >
          <Dialog.Title className="sr-only">Befehlspalette</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 dark:border-dark-border">
            <Search className="size-4 text-gray-400" aria-hidden />
            <input
              autoFocus
              value={query}
              placeholder={placeholder}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(filtered.length - 1, a + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const item = filtered[active];
                  if (item) activate(item);
                }
              }}
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-dark-text"
            />
            <kbd className="hidden rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono dark:bg-dark-border sm:inline-flex">
              ESC
            </kbd>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-gray-400 dark:text-dark-muted">
                Keine Treffer für „{query}"
              </div>
            ) : (
              groups.map(([group, list]) => (
                <div key={group} className="mb-2">
                  {group && (
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {group}
                    </p>
                  )}
                  <ul>
                    {list.map((item) => {
                      const isActive = filtered[active]?.id === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(filtered.indexOf(item))}
                            onClick={() => activate(item)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                              isActive
                                ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                                : "text-gray-700 dark:text-dark-text",
                            )}
                          >
                            {item.icon && (
                              <span className="grid size-6 shrink-0 place-items-center text-gray-400">
                                {item.icon}
                              </span>
                            )}
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.description && (
                              <span className="hidden truncate text-xs text-gray-400 dark:text-dark-muted sm:inline">
                                {item.description}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
