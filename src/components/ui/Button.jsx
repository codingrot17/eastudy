export default function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}) {
    const base =
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-primary-700 hover:bg-primary-600 text-white shadow-md hover:shadow-lg",
        outline:
            "border-2 border-primary-700 text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 dark:text-primary-400 dark:border-primary-400",
        ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
