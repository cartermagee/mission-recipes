"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, LogOut, ShoppingCart, User as UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  userName: string;
  householdName: string;
  isAdmin: boolean;
}

const navItems = [
  { href: "/recipes", label: "Recipes" },
  { href: "/shopping-list", label: "Shopping List" },
  { href: "/preferences", label: "Preferences" },
  { href: "/household", label: "Household" },
];

export function AppHeader({ userName, householdName, isAdmin }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/recipes" className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="font-bold">Mission Recipes</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label === "Shopping List" ? (
                  <span className="inline-flex items-center gap-1">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-xs leading-tight">
            <span className="font-medium">
              <UserIcon className="mr-1 inline h-3 w-3" />
              {userName}
            </span>
            <span className="text-muted-foreground">
              {householdName}{" "}
              {isAdmin ? (
                <Badge variant="secondary" className="ml-1 text-[9px]">
                  Admin
                </Badge>
              ) : null}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <nav className="md:hidden border-t bg-background">
        <div className="container flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
