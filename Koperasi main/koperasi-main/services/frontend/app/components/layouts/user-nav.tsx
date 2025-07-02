import { Form, Link, useNavigation } from "@remix-run/react";
import { ChevronDownIcon, LogOutIcon, User2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type UserNavProps = {
  profileHref: string;
  username: string;
  phone: string;
};

export function UserNav({ profileHref, username, phone }: UserNavProps) {
  const navigation = useNavigation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative items-center gap-1.5 rounded-full border-none ps-0 pe-2 ring-0 ring-offset-0 hover:bg-transparent"
          variant="ghost"
        >
          <div className="rounded-full bg-primary p-1.5">
            <User2 className="text-white" />
          </div>
          <ChevronDownIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm uppercase leading-none">{username}</p>
            <p className="text-muted-foreground text-xs leading-none">{phone}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link className="w-full cursor-pointer" to={profileHref}>
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Form className="!p-0" method="post" action="/action/logout">
            <Button
              className="w-full cursor-pointer justify-between text-start"
              disabled={navigation.state === "submitting"}
              size="sm"
              variant="ghost"
              type="submit"
            >
              Keluar <LogOutIcon className="size-5" />
            </Button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
