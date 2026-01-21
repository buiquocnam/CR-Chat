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
import { useSignIn } from "@/features/auth/hooks/useSignIn";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutate: signIn, isPending } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    signIn({ email, password });
  };

  return (
    <div className={cn("flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ring-1 ring-black/5">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-10" onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
                <p className="text-muted-foreground text-sm">
                  Login to your account to continue
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium ml-1">Email</FieldLabel>
                <Input
                  className="bg-secondary/50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/20 h-12 px-4 transition-all"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium ml-1">Password</FieldLabel>
                <div className="relative">
                  <Input
                    className="bg-secondary/50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/20 h-12 px-4 pr-10 transition-all"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </Field>

              <Field>
                <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 text-primary-foreground text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </Field>

              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
                  Sign up
                </Link>
              </div>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block h-full min-h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
              alt="Login Image"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
