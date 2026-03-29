import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Button from "../ui/Button";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const links = ["Features", "How It Works", "Waitlist"];

    const scrollTo = id => {
        document
            .getElementById(id.toLowerCase().replace(/\s+/g, "-"))
            ?.scrollIntoView({ behavior: "smooth" });
        setMenuOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                        Eastudy
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map(link => (
                        <button
                            key={link}
                            onClick={() => scrollTo(link)}
                            className="text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 font-medium transition-colors"
                        >
                            {link}
                        </button>
                    ))}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/auth/login"
                        className="hidden md:inline-flex text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                        Sign In
                    </Link>
                    <ThemeToggle />
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            to="/auth/rep/signup"
                            className="text-sm font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Rep Sign Up
                        </Link>
                        <Link
                            to="/auth/student/signup"
                            className="text-sm font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Student Sign Up
                        </Link>
                    </div>
                    <Button
                        size="sm"
                        className="hidden md:inline-flex"
                        onClick={() => scrollTo("Waitlist")}
                    >
                        Join Waitlist
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col gap-3">
                    {links.map(link => (
                        <button
                            key={link}
                            onClick={() => scrollTo(link)}
                            className="text-left text-slate-700 dark:text-slate-300 font-medium py-2 border-b border-slate-100 dark:border-slate-800"
                        >
                            {link}
                        </button>
                    ))}
                    <Link
                        to="/auth/login"
                        onClick={() => setMenuOpen(false)}
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors py-2"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/auth/rep/signup"
                        onClick={() => setMenuOpen(false)}
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors py-2"
                    >
                        Rep Sign Up
                    </Link>
                    <Link
                        to="/auth/student/signup"
                        onClick={() => setMenuOpen(false)}
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors py-2"
                    >
                        Student Sign Up
                    </Link>
                    <Button
                        className="mt-2"
                        onClick={() => {
                            scrollTo("Waitlist");
                            setMenuOpen(false);
                        }}
                    >
                        Join Waitlist
                    </Button>
                </div>
            )}
        </nav>
    );
}
