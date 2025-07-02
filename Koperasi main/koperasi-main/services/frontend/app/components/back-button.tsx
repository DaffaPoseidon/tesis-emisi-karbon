import { Link, type LinkProps } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "./ui/button";

type BackButtonProps = LinkProps;

const BackButton = forwardRef<HTMLAnchorElement, BackButtonProps>((props, ref) => {
  return (
    <Button asChild className="size-9 rounded-full" size="icon">
      <Link {...props} ref={ref}>
        <ChevronLeft className="size-7 text-white" />
      </Link>
    </Button>
  );
});

export default BackButton;
