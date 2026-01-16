export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">

            {/* Soft Pastel Background Elements */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-200/40 blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-200/30 blur-2xl animate-bounce delay-500 duration-[5000ms]" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl p-6 md:p-10 flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}
