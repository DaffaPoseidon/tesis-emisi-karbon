import { Link, useLocation } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { Icons } from "~/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useSidebar } from "~/hooks/use-sidebar";
import { cn } from "~/lib/clsx";
import type { NavItem } from "~/types/constants/nav-item";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({ items, setOpen, isMobileNav = false }: DashboardNavProps) {
  const location = useLocation();
  const { isMinimized } = useSidebar();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="grid items-start gap-1.5">
      <TooltipProvider>
        <Accordion className="grid w-full items-start gap-1.5" type="multiple">
          {items.map((item, index) => {
            const Icon = Icons[item.icon || "arrowRight"];

            if (item.subItems && item.subItems.length > 0) {
              return (
                <Tooltip key={index}>
                  <AccordionItem className="border-b-0" value={`item-${index}`}>
                    <TooltipTrigger asChild>
                      <AccordionTrigger className="rounded-md px-3 py-2 text-gray-700 hover:bg-primary/10 hover:text-primary hover:no-underline">
                        <span className="flex items-center gap-2">
                          <Icon className="size-5 flex-none" />
                          {isMobileNav || (!isMinimized && !isMobileNav) ? (
                            <span className="truncate font-semibold text-sm">{item.title}</span>
                          ) : (
                            ""
                          )}
                        </span>
                      </AccordionTrigger>
                    </TooltipTrigger>
                    <AccordionContent className="!pb-0">
                      <ul className="space-y-1 py-2">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  className={cn(
                                    "flex items-center gap-2 rounded-md py-2 font-semibold text-gray-700 text-sm hover:bg-primary/10 hover:text-primary",
                                    location.pathname.startsWith(subItem.href || "")
                                      ? "bg-primary/10 text-primary"
                                      : "transparent",
                                    subItem.disabled && "cursor-not-allowed opacity-80",
                                    isMinimized ? "pr-0 pl-4" : "pr-3 pl-8",
                                  )}
                                  to={subItem.disabled ? "/" : subItem.href || "/"}
                                  onClick={() => {
                                    if (setOpen) setOpen(false);
                                  }}
                                >
                                  {isMobileNav || (!isMinimized && !isMobileNav) ? (
                                    <span className="truncate font-semibold text-sm">
                                      {subItem.title}
                                    </span>
                                  ) : (
                                    subItem.subTitle
                                  )}
                                </Link>
                              </TooltipTrigger>
                              {isMinimized && (
                                <TooltipContent align="center" side="right" sideOffset={8}>
                                  {subItem.title}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <TooltipContent
                    align="start"
                    className={!isMinimized ? "hidden" : "inline-block"}
                    side="right"
                    sideOffset={8}
                  >
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 font-semibold text-gray-700 text-sm hover:bg-primary/10 hover:text-primary",
                      location.pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "transparent",
                      item.disabled && "cursor-not-allowed opacity-80",
                    )}
                    to={item.disabled ? "/" : item.href || "/"}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                  >
                    <Icon className="size-5 flex-none" />
                    {isMobileNav || (!isMinimized && !isMobileNav) ? (
                      <span className="truncate font-semibold">{item.title}</span>
                    ) : (
                      ""
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  className={!isMinimized ? "hidden" : "inline-block"}
                  side="right"
                  sideOffset={8}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </Accordion>
      </TooltipProvider>
    </nav>
  );
}
