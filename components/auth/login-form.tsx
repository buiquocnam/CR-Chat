"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@/hooks/auth/useSignIn";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutate: signIn, isPending } = useSignIn();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    signIn({ email, password });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">
                  Login to your account
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"   // ⭐ BẮT BUỘC
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password" // ⭐ BẮT BUỘC
                  type="password"
                  required
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </Field>

              <FieldSeparator>Or continue with</FieldSeparator>

              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="#">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ-_2BPSK-YAt4AawPTtvbRL8BW9A0JnFf7PsLj_9DibxKyVouwksokQtJzHMeT1uoMrMlejub8StBcOjErAlrb_nmcHxO594uCSpI5wPMn4ahIae9RO02AsALXeBf0CEELVXpFsNOI2racoULNZ163KXzhDdFGf_vi8bw1DrJhN9KmABoP_B4RfKbeLWIXrESKsoEj4wWH8OQFO44bNeJplxd1G5viG273S4ZbCvy-jlfyMeRSaxBPFvfj6ItcmOFEgJ3lc3toHU"
              alt="Login Image"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              loading="eager"
              unoptimized
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
