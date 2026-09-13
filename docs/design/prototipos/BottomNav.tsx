import { Link, useLocation } from "react-router-dom";
import { Dumbbell, TrendingUp, Newspaper, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/treinar", label: "Treinar", icon: Dumbbell },
  { to: "/progresso", label: "Progresso", icon: TrendingUp },
  { to: "/feed", label: "Feed", icon: Newspaper },
  { to: "/perfil", label: "Perfil", icon: User },
];

// Set to true to test the "top bar" variation instead of the pill background.
const USE_TOP_BAR_VARIANT = false;

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegação principal"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname.startsWith(to);

        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-h-11",
              "transition-colors duration-150"
            )}
          >
            {USE_TOP_BAR_VARIANT ? (
              /* --- Variação B: barra fina no topo, sem pill --- */
              <>
                <span
                  className={cn(
                    "absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full transition-colors duration-150",
                    isActive ? "bg-danger" : "bg-transparent"
                  )}
                />
                <Icon
                  size={22}
                  className={cn(
                    "transition-colors duration-150",
                    isActive ? "text-danger" : "text-secondary"
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] transition-colors duration-150",
                    isActive ? "font-medium text-danger" : "text-secondary"
                  )}
                >
                  {label}
                </span>
              </>
            ) : (
              /* --- Variação A (default): pill de fundo no ícone ativo --- */
              <>
                <span
                  className={cn(
                    "flex h-[30px] w-[52px] items-center justify-center rounded-full transition-colors duration-150",
                    isActive && "bg-danger-50"
                  )}
                >
                  <Icon
                    size={22}
                    className={cn(
                      "transition-colors duration-150",
                      isActive ? "text-danger-600" : "text-secondary"
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "text-[11px] transition-colors duration-150",
                    isActive ? "font-medium text-danger-600" : "text-secondary"
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
