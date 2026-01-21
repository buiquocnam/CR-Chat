import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useSignUp } from "@/features/auth/hooks/useSignUp"
import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutate: signUp, isPending } = useSignUp();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }
    setError("");
    signUp({
      email: formData.email,
      username: formData.username,
      password: formData.password,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ring-1 ring-black/5">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-10" onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Create account</h1>
                <p className="text-muted-foreground text-sm">
                  Enter your details to get started
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium ml-1">Email</FieldLabel>
                <Input
                  className="bg-secondary/50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/20 h-11 px-4 transition-all"
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="username" className="text-sm font-medium ml-1">Username</FieldLabel>
                <Input
                  className="bg-secondary/50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/20 h-11 px-4 transition-all"
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <Field>
                  <FieldLabel htmlFor="password" className="text-sm font-medium ml-1">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      className="bg-secondary/50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/20 h-11 px-4 pr-10 transition-all"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
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
                  <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium ml-1">
                    Confirm Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      className="bg-secondary/50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/20 h-11 px-4 pr-10 transition-all"
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </Field>
                {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100 text-center">{error}</p>}

              </Field>
              <Field>
                <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 text-primary-foreground text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {isPending ? "Creating account..." : "Sign Up"}
                </Button>
              </Field>

              <Field>
                <Button variant="outline" type="button" className="w-full h-11 rounded-xl border-border hover:bg-muted/50 hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </Field>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">Login</Link>
              </div>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block h-full min-h-[600px]">
            <Image
              src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop"
              alt="Signup Image"
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
      <div className="px-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a>{" "}
        and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  )
}
