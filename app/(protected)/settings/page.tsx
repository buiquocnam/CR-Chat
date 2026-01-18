"use client"

import { useTheme } from "next-themes"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Moon, Sun, Monitor } from "lucide-react" // Icons
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
    const { setTheme, theme } = useTheme()
    const [brightness, setBrightness] = useState([100])
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch and load initial brightness
    useEffect(() => {
        setMounted(true)
        const storedContent = localStorage.getItem('app-brightness')
        if (storedContent) {
            const val = parseFloat(storedContent)
            if (!isNaN(val)) {
                setBrightness([Math.round(val * 100)])
                document.documentElement.style.setProperty('--brightness', val.toString())
            }
        }
    }, [])

    const handleBrightnessChange = (value: number[]) => {
        setBrightness(value)
        const bValue = (value[0] / 100).toString()
        document.documentElement.style.setProperty('--brightness', bValue)
        localStorage.setItem('app-brightness', bValue)
    }

    if (!mounted) {
        return (
            <div className="container max-w-4xl mx-auto py-10 space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-muted rounded-md" />
                <div className="h-64 w-full bg-muted rounded-xl" />
            </div>
        )
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 space-y-8 px-4 md:px-0">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
                <p className="text-muted-foreground mt-2">Quản lý giao diện và tùy chọn ứng dụng.</p>
            </div>

            <div className="grid gap-6">
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-black/20">
                    <CardHeader>
                        <CardTitle>Giao diện</CardTitle>
                        <CardDescription>Tùy chỉnh giao diện sáng/tối và độ sáng màn hình.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {/* Theme Selection */}
                        <div className="space-y-4">
                            <Label className="text-base font-medium">Chế độ hiển thị</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    className="h-auto flex flex-col items-center gap-3 py-6 rounded-xl transition-all hover:scale-[1.02]"
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun className="h-8 w-8" />
                                    <span className="font-medium">Sáng</span>
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    className="h-auto flex flex-col items-center gap-3 py-6 rounded-xl transition-all hover:scale-[1.02]"
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon className="h-8 w-8" />
                                    <span className="font-medium">Tối</span>
                                </Button>
                                <Button
                                    variant={theme === 'system' ? 'default' : 'outline'}
                                    className="h-auto flex flex-col items-center gap-3 py-6 rounded-xl transition-all hover:scale-[1.02]"
                                    onClick={() => setTheme('system')}
                                >
                                    <Monitor className="h-8 w-8" />
                                    <span className="font-medium">Hệ thống</span>
                                </Button>
                            </div>
                        </div>

                        {/* Brightness Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Độ sáng</Label>
                                <span className="text-sm font-medium px-2 py-1 bg-muted rounded-md min-w-[3rem] text-center">
                                    {brightness[0]}%
                                </span>
                            </div>
                            <Slider
                                defaultValue={[100]}
                                value={brightness}
                                max={120}
                                min={30}
                                step={1}
                                onValueChange={handleBrightnessChange}
                                className="w-full py-4"
                            />
                            <p className="text-sm text-muted-foreground">
                                Điều chỉnh độ sáng tối của ứng dụng (Thích hợp khi dùng ban đêm).
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
