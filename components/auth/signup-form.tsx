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
import { useSignUp } from "@/hooks/auth/useSignUp"
import { useState } from "react"
import Link from "next/link"

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Nhập email, tên người dùng và mật khẩu
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Tên người dùng</FieldLabel>
                <Input
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
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Nhập lại mật khẩu
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Field>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <FieldDescription>
                  Tối thiểu 6 ký tự.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Đang tạo..." : "Đăng ký"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc tiếp tục với
              </FieldSeparator>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Sign up with Google</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
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
      <FieldDescription className="px-6 text-center">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        và <a href="#">Chính sách quyền riêng tư</a>.
      </FieldDescription>
    </div>
  )
}
