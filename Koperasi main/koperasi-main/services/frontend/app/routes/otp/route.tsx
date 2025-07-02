import { Form, Outlet, useNavigation } from "@remix-run/react";
import { LogOutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import RegisterCarousel from "../auth/components/RegisterCarousel";

export default function OTPLayout() {
  const navigation = useNavigation();
  return (
    <main className="max-h-screen min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden lg:block xl:p-10}">
        <div className="relative flex h-full items-center justify-center rounded-md bg-[#F1FFF9]">
          <RegisterCarousel />
        </div>
      </div>
      <div className="flex max-h-screen items-center justify-center overflow-auto py-12">
        <Form className="!p-0 absolute top-5 right-10" method="post" action="/action/logout">
          <Button
            className="w-full cursor-pointer justify-between text-start"
            disabled={navigation.state === "submitting"}
            variant="destructive"
            type="submit"
          >
            Keluar <LogOutIcon className="ms-3 size-5" />
          </Button>
        </Form>
        <Outlet />
      </div>
    </main>
  );
}
