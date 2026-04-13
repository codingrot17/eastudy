// src/pages/LandingPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Menu,
    X,
    ArrowRight,
    GraduationCap,
    ShieldCheck,
    CalendarDays,
    Megaphone,
    FolderOpen,
    ClipboardList,
    Users,
    Lightbulb,
    Zap,
    Smartphone,
    CheckCircle,
    Pin,
    Clock,
    MapPin,
    ChevronRight,
    Star
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import WaitlistForm from "../components/shared/WaitlistForm";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
};

// ── Navbar ──────────────────────────────────────────────────────────────
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const scrollTo = id => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setMenuOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                        Eastudy
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <button
                        onClick={() => scrollTo("features")}
                        className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                        Features
                    </button>
                    <button
                        onClick={() => scrollTo("how-it-works")}
                        className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                        How it works
                    </button>
                    <button
                        onClick={() => scrollTo("for-reps")}
                        className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                        For reps
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <ThemeToggle />
                    <Link
                        to="/auth/login"
                        className="text-sm font-medium px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/auth/student/signup"
                        className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Student
                    </Link>
                    <Link
                        to="/auth/rep/signup"
                        className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-600 text-white transition-colors"
                    >
                        Rep signup
                    </Link>
                </div>

                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-col gap-3">
                    {["features", "how-it-works", "for-reps"].map(id => (
                        <button
                            key={id}
                            onClick={() => scrollTo(id)}
                            className="text-left text-slate-700 dark:text-slate-300 font-medium py-2 capitalize border-b border-slate-100 dark:border-slate-800"
                        >
                            {id.replace(/-/g, " ")}
                        </button>
                    ))}
                    <Link
                        to="/auth/login"
                        onClick={() => setMenuOpen(false)}
                        className="text-slate-700 dark:text-slate-300 font-medium py-2 border-b border-slate-100 dark:border-slate-800"
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/auth/student/signup"
                        onClick={() => setMenuOpen(false)}
                        className="text-slate-700 dark:text-slate-300 font-medium py-2 border-b border-slate-100 dark:border-slate-800"
                    >
                        Student sign up
                    </Link>
                    <Link
                        to="/auth/rep/signup"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 bg-primary-700 text-white font-semibold rounded-xl mt-1"
                    >
                        Register your department <ArrowRight size={16} />
                    </Link>
                </div>
            )}
        </nav>
    );
}

// ── Mock UI components for the preview section ─────────────────────────
function MockAnnouncement({ text, pinned, time }) {
    return (
        <div
            className={`rounded-xl border p-3 flex flex-col gap-1.5 ${
                pinned
                    ? "border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10"
                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
            }`}
        >
            {pinned && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary-700 dark:text-primary-400">
                    <Pin size={9} /> Pinned
                </div>
            )}
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {text}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock size={9} /> {time}
            </div>
        </div>
    );
}

function MockScheduleRow({ code, name, time, venue }) {
    return (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-indigo-400 border border-slate-100 dark:border-slate-700">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                        {code}
                    </span>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {name}
                    </span>
                </div>
                <div className="flex gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={8} />
                        {time}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MapPin size={8} />
                        {venue}
                    </span>
                </div>
            </div>
        </div>
    );
}

function MockQuizCard() {
    return (
        <div className="rounded-xl border border-green-200 dark:border-green-800 p-3 bg-white dark:bg-slate-900 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    PUBLISHED
                </span>
                <span className="text-[10px] text-slate-400">
                    10 questions · 15 min
                </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                CSC 302 — Midterm Practice
            </p>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[68%] bg-primary-700 rounded-full" />
            </div>
            <p className="text-[10px] text-slate-400">
                14/21 students submitted · avg 72%
            </p>
        </div>
    );
}

// ── Main ────────────────────────────────────────────────────────────────
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
            <Navbar />

            {/* ── Hero ── */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center px-5 pt-28 pb-20">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="max-w-3xl mx-auto flex flex-col items-center gap-6"
                >
                    <motion.div variants={fadeUp}>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold border border-emerald-200 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Now live · Lagos State University
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
                    >
                        Your class,{" "}
                        <span className="bg-gradient-to-r from-primary-700 to-cyan-500 bg-clip-text text-transparent">
                            finally in one place
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed"
                    >
                        Eastudy replaces the WhatsApp chaos — your schedule,
                        announcements, study materials, quizzes, and group
                        sessions, all synced live for your entire department.
                    </motion.p>

                    {/* Dual CTA */}
                    <motion.div
                        variants={fadeUp}
                        className="w-full max-w-md flex flex-col sm:flex-row gap-3"
                    >
                        <Link
                            to="/auth/rep/signup"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary-700 hover:bg-primary-600 text-white font-bold text-sm transition-all shadow-lg shadow-primary-700/20 hover:shadow-primary-700/30"
                        >
                            <ShieldCheck size={16} />
                            I'm a class rep
                            <ArrowRight size={15} />
                        </Link>
                        <Link
                            to="/auth/student/signup"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            <GraduationCap size={16} />
                            I'm a student
                        </Link>
                    </motion.div>

                    <motion.p
                        variants={fadeUp}
                        className="text-xs text-slate-400"
                    >
                        Free for everyone · No app store needed · Works on any
                        phone
                    </motion.p>

                    {/* Feature pills */}
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-wrap gap-2 justify-center mt-2"
                    >
                        {[
                            "Live announcements",
                            "Weekly timetable",
                            "Study materials",
                            "Practice quizzes",
                            "Group study sessions",
                            "Offline-ready PWA"
                        ].map(f => (
                            <span
                                key={f}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            >
                                <CheckCircle
                                    size={11}
                                    className="text-emerald-500 shrink-0"
                                />
                                {f}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ── App Preview ── */}
            <section className="py-20 px-5 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        <motion.div
                            variants={fadeUp}
                            className="text-center mb-14"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400 mb-3">
                                App preview
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                See what it looks like
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                                A real look at the rep dashboard and student
                                view — clean, mobile-first, and built for
                                Nigerian university life.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="grid md:grid-cols-2 gap-6 lg:gap-10"
                        >
                            {/* Rep side */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                        <ShieldCheck
                                            size={16}
                                            className="text-primary-700 dark:text-primary-400"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">
                                            Rep dashboard
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Manage your entire class from here
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                                    {/* Welcome bar */}
                                    <div className="bg-gradient-to-r from-[#1E1B4B] to-primary-700 rounded-xl p-4 text-white flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-indigo-200">
                                                Good morning, Rep 👋
                                            </p>
                                            <p className="font-bold text-lg">
                                                Adewale
                                            </p>
                                            <p className="text-xs text-indigo-300 mt-0.5">
                                                Computer Science · 300L ·
                                                2024/2025
                                            </p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
                                            <p className="text-[10px] text-indigo-200 uppercase tracking-widest">
                                                Code
                                            </p>
                                            <p className="font-mono font-bold text-sm">
                                                LASU-CS300
                                            </p>
                                        </div>
                                    </div>
                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            {
                                                label: "Students",
                                                val: "47/200",
                                                color: "text-cyan-600"
                                            },
                                            {
                                                label: "Materials",
                                                val: "12",
                                                color: "text-violet-600"
                                            },
                                            {
                                                label: "Today",
                                                val: "3 classes",
                                                color: "text-amber-600"
                                            }
                                        ].map(s => (
                                            <div
                                                key={s.label}
                                                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-center"
                                            >
                                                <p
                                                    className={`font-extrabold text-sm ${s.color}`}
                                                >
                                                    {s.val}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {s.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Announcements */}
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                        Recent announcements
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <MockAnnouncement
                                            pinned
                                            text="No lecture for CSC 301 this Friday. Make-up class Monday 8AM."
                                            time="2h ago"
                                        />
                                        <MockAnnouncement
                                            text="MTH 302 assignment due Sunday midnight. Check materials tab for the PDF."
                                            time="Yesterday"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Student side */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <GraduationCap
                                            size={16}
                                            className="text-emerald-700 dark:text-emerald-400"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">
                                            Student view
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Everything you need in one feed
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                                    {/* Today banner */}
                                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-4 text-white">
                                        <div className="flex items-center gap-2 text-cyan-100 text-xs mb-2">
                                            <CalendarDays size={12} /> Monday,
                                            April 14
                                        </div>
                                        <p className="font-bold text-base">
                                            3 classes today
                                        </p>
                                        <p className="text-cyan-200 text-xs mt-0.5">
                                            First up: CSC 302 · 8:00 AM · LT 3
                                        </p>
                                    </div>
                                    {/* Schedule */}
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                        Today's schedule
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <MockScheduleRow
                                            code="CSC 302"
                                            name="Data Structures"
                                            time="8:00–10:00 AM"
                                            venue="LT 3"
                                        />
                                        <MockScheduleRow
                                            code="MTH 302"
                                            name="Numerical Analysis"
                                            time="12:00–2:00 PM"
                                            venue="LT 1"
                                        />
                                    </div>
                                    {/* Quiz preview */}
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                        Quiz from your rep
                                    </p>
                                    <MockQuizCard />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-20 px-5">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        <motion.div
                            variants={fadeUp}
                            className="text-center mb-14"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400 mb-3">
                                Everything included
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Built for how your class actually works
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                                Every feature was designed around real
                                university pain points — not generic
                                productivity templates.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {[
                                {
                                    icon: Megaphone,
                                    color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
                                    title: "Pinned announcements",
                                    desc: "Post updates that stick at the top. Students get notified the moment you post — no WhatsApp noise."
                                },
                                {
                                    icon: CalendarDays,
                                    color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
                                    title: "Live timetable",
                                    desc: "Add, edit, or cancel classes and the whole department sees the change instantly, with push notifications."
                                },
                                {
                                    icon: FolderOpen,
                                    color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
                                    title: "Study materials",
                                    desc: "Share Google Drive links, PDFs, past questions, and textbooks — organised by category and searchable."
                                },
                                {
                                    icon: ClipboardList,
                                    color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
                                    title: "Quizzes & practice tests",
                                    desc: "Reps create MCQ quizzes, students take them with a live timer, and results show a full leaderboard."
                                },
                                {
                                    icon: Users,
                                    color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
                                    title: "Group study sessions",
                                    desc: "Schedule study meetups with a time, location, and headcount limit. Anyone in the class can join."
                                },
                                {
                                    icon: Lightbulb,
                                    color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
                                    title: "Study plans",
                                    desc: "Personal task lists for individual goals, plus shared plans the rep can push to the whole class."
                                }
                            ].map(({ icon: Icon, color, title, desc }) => (
                                <motion.div
                                    key={title}
                                    variants={fadeUp}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {desc}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Problem / Social proof ── */}
            <section className="py-20 px-5 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        <motion.div
                            variants={fadeUp}
                            className="text-center mb-12"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400 mb-3">
                                The problem we solve
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Sound familiar?
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                                Every LASU student knows this. Eastudy fixes all
                                of it.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            className="grid md:grid-cols-2 gap-4"
                        >
                            {[
                                {
                                    pain: "Important announcements buried under 300 memes in the WhatsApp group",
                                    fix: "Pinned announcements with push notifications"
                                },
                                {
                                    pain: '"What time is CSC 302 again?" asked every Monday morning',
                                    fix: "Live timetable accessible from home screen"
                                },
                                {
                                    pain: "Past questions and notes scattered across 7 different Google Drive links",
                                    fix: "One materials tab, organised by category"
                                },
                                {
                                    pain: "Rep posts exam updates at 11pm and half the class misses it",
                                    fix: "Instant push notifications, even when the app is closed"
                                }
                            ].map(({ pain, fix }) => (
                                <motion.div
                                    key={fix}
                                    variants={fadeUp}
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-3"
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1.5" />
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                            "{pain}"
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle
                                            size={14}
                                            className="text-emerald-500 shrink-0 mt-0.5"
                                        />
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {fix}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section id="how-it-works" className="py-20 px-5">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        <motion.div
                            variants={fadeUp}
                            className="text-center mb-14"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400 mb-3">
                                Setup
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Up and running in 3 minutes
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                Simple for reps. Even simpler for students.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            className="grid md:grid-cols-2 gap-10 items-start"
                        >
                            {/* Rep steps */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center">
                                        <ShieldCheck
                                            size={14}
                                            className="text-white"
                                        />
                                    </div>
                                    <p className="font-bold text-sm">
                                        For class reps
                                    </p>
                                </div>
                                <div className="flex flex-col gap-6">
                                    {[
                                        {
                                            n: "1",
                                            title: "Register your department",
                                            desc: "Sign up, enter your school, department name, level and session. Takes 2 minutes."
                                        },
                                        {
                                            n: "2",
                                            title: "Get your class code",
                                            desc: (
                                                <>
                                                    You receive a unique code
                                                    like{" "}
                                                    <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
                                                        LASU-CS300-X7K2
                                                    </code>
                                                    . Share it once — in the
                                                    WhatsApp group, during
                                                    class, anywhere.
                                                </>
                                            )
                                        },
                                        {
                                            n: "3",
                                            title: "Start managing",
                                            desc: "Post announcements, build the timetable, upload materials. Everything syncs live to every student who joined."
                                        }
                                    ].map(({ n, title, desc }) => (
                                        <div key={n} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {n}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm mb-1">
                                                    {title}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    to="/auth/rep/signup"
                                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors"
                                >
                                    Register your department{" "}
                                    <ArrowRight size={15} />
                                </Link>
                            </div>

                            {/* Student steps */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                                        <GraduationCap
                                            size={14}
                                            className="text-white"
                                        />
                                    </div>
                                    <p className="font-bold text-sm">
                                        For students
                                    </p>
                                </div>
                                <div className="flex flex-col gap-6">
                                    {[
                                        {
                                            n: "1",
                                            title: "Get the code from your rep",
                                            desc: "Your class rep shares a unique code. Ask them for it or check the WhatsApp group."
                                        },
                                        {
                                            n: "2",
                                            title: "Sign up and enter the code",
                                            desc: "Create an account in 30 seconds, enter the code, and you're instantly linked to your department — no waiting for approval."
                                        },
                                        {
                                            n: "3",
                                            title: "Add to your home screen",
                                            desc: 'Tap "Add to Home Screen" in your browser. Eastudy works like a native app, loads instantly, and works offline.'
                                        }
                                    ].map(({ n, title, desc }) => (
                                        <div key={n} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {n}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm mb-1">
                                                    {title}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    to="/auth/student/signup"
                                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-sm rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                >
                                    Join with your code <ArrowRight size={15} />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── For reps highlight ── */}
            <section
                id="for-reps"
                className="py-20 px-5 bg-[#1E1B4B] text-white overflow-hidden relative"
            >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
                <div className="max-w-5xl mx-auto relative">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        <motion.div
                            variants={fadeUp}
                            className="text-center mb-14"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
                                Class reps
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                You do enough. Let Eastudy handle the rest.
                            </h2>
                            <p className="text-indigo-300 max-w-xl mx-auto">
                                Being a class rep is harder than people think.
                                Eastudy gives you tools that actually match the
                                job.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {[
                                {
                                    icon: Zap,
                                    title: "One post, 200 students notified",
                                    desc: "Post once. Every student with notifications on gets an instant push — even when the app isn't open."
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Assign an assistant rep",
                                    desc: "Delegate to a trusted classmate. They get full posting access so you're not the bottleneck."
                                },
                                {
                                    icon: ClipboardList,
                                    title: "Create quizzes in minutes",
                                    desc: "Build MCQ tests, set a timer, publish. Students take them live and you get a leaderboard instantly."
                                },
                                {
                                    icon: Users,
                                    title: "See who joined",
                                    desc: "Real-time student count. See exactly who's signed up from your class code and who's missing."
                                },
                                {
                                    icon: FolderOpen,
                                    title: "Materials that don't get lost",
                                    desc: "Share a link once and it lives in the materials tab forever — organised, searchable, never buried."
                                },
                                {
                                    icon: Smartphone,
                                    title: "Manage from your phone",
                                    desc: "Full rep dashboard on mobile. Post announcements between lectures without needing a laptop."
                                }
                            ].map(({ icon: Icon, title, desc }) => (
                                <motion.div
                                    key={title}
                                    variants={fadeUp}
                                    className="bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl p-5 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                                        <Icon
                                            size={18}
                                            className="text-cyan-400"
                                        />
                                    </div>
                                    <h3 className="font-bold text-sm mb-1.5 text-white">
                                        {title}
                                    </h3>
                                    <p className="text-xs text-indigo-300 leading-relaxed">
                                        {desc}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="text-center mt-12"
                        >
                            <Link
                                to="/auth/rep/signup"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold text-sm rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg"
                            >
                                Register your department — it's free
                                <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── PWA callout ── */}
            <section className="py-20 px-5">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row gap-10 items-center"
                    >
                        <motion.div variants={fadeUp} className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400 mb-3">
                                Works like a native app
                            </p>
                            <h2 className="text-3xl font-bold mb-4">
                                No App Store. No Play Store.
                                <br />
                                Just add to home screen.
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                Eastudy is a Progressive Web App. Open it in any
                                browser, tap "Add to Home Screen," and it
                                installs like a proper app — fast loading,
                                offline support, push notifications included.
                            </p>
                            <div className="flex flex-col gap-2">
                                {[
                                    "Works on Android, iOS, and any browser",
                                    "Offline access to your schedule and materials",
                                    "Push notifications for announcements",
                                    "Loads as fast as a native app"
                                ].map(f => (
                                    <div
                                        key={f}
                                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                                    >
                                        <CheckCircle
                                            size={15}
                                            className="text-emerald-500 shrink-0"
                                        />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="flex-1 flex items-center justify-center"
                        >
                            <div className="relative">
                                {/* Phone mockup */}
                                <div className="w-56 h-96 bg-slate-900 rounded-3xl border-4 border-slate-700 overflow-hidden shadow-2xl">
                                    <div className="bg-[#1E1B4B] h-10 flex items-center justify-center">
                                        <div className="w-16 h-1.5 bg-slate-600 rounded-full" />
                                    </div>
                                    <div className="p-3 flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 h-full">
                                        <div className="bg-gradient-to-r from-[#1E1B4B] to-primary-700 rounded-xl p-3 text-white">
                                            <p className="text-[10px] text-indigo-200">
                                                Good morning 👋
                                            </p>
                                            <p className="font-bold text-sm">
                                                Chioma
                                            </p>
                                            <p className="text-[10px] text-indigo-300">
                                                CSC 300 · 2 classes today
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                "3 updates",
                                                "12 materials",
                                                "1 quiz",
                                                "2 sessions"
                                            ].map(s => (
                                                <div
                                                    key={s}
                                                    className="bg-white dark:bg-slate-800 rounded-xl p-2 text-center border border-slate-100 dark:border-slate-700"
                                                >
                                                    <p className="text-xs font-bold text-primary-700 dark:text-primary-400">
                                                        {s.split(" ")[0]}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 capitalize">
                                                        {s
                                                            .split(" ")
                                                            .slice(1)
                                                            .join(" ")}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <MockAnnouncement
                                            pinned
                                            text="Exam timetable is out. Check materials."
                                            time="Just now"
                                        />
                                        <MockScheduleRow
                                            code="CSC 302"
                                            name="Data Structures"
                                            time="8:00 AM"
                                            venue="LT 3"
                                        />
                                    </div>
                                </div>
                                {/* Install prompt bubble */}
                                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-lg max-w-[160px]">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Add to Home Screen
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Tap to install Eastudy
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <button className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-primary-700 text-white">
                                            Add
                                        </button>
                                        <button className="flex-1 text-[10px] font-medium py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">
                                            Later
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 px-5 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        <motion.div variants={fadeUp}>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold border border-emerald-200 dark:border-emerald-800 mb-6">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Live now at LASU
                            </span>
                        </motion.div>

                        <motion.h2
                            variants={fadeUp}
                            className="text-3xl md:text-5xl font-extrabold mb-6"
                        >
                            Ready to fix your class communication?
                        </motion.h2>
                        <motion.p
                            variants={fadeUp}
                            className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto"
                        >
                            If you're a rep, register your department and share
                            the code. If you're a student, get the code from
                            your rep and join in 30 seconds.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                        >
                            <Link
                                to="/auth/rep/signup"
                                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary-700 hover:bg-primary-600 text-white font-bold text-base transition-all shadow-lg shadow-primary-700/20"
                            >
                                <ShieldCheck size={18} />
                                Register as class rep
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                to="/auth/student/signup"
                                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-base hover:bg-white dark:hover:bg-slate-800 transition-all"
                            >
                                <GraduationCap size={18} />
                                Join as student
                            </Link>
                        </motion.div>

                        {/* Stats row */}
                        <motion.div
                            variants={fadeUp}
                            className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-16"
                        >
                            {[
                                { n: "100%", label: "Free" },
                                { n: "PWA", label: "No install" },
                                { n: "Live", label: "Real-time" }
                            ].map(({ n, label }) => (
                                <div
                                    key={label}
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 py-4 px-2 text-center"
                                >
                                    <p className="font-extrabold text-xl text-primary-700 dark:text-primary-400">
                                        {n}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </motion.div>

                        {/* Waitlist as secondary opt-in */}
                        <motion.div variants={fadeUp}>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md mx-auto">
                                <p className="font-bold text-sm mb-1">
                                    Not at LASU?
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    We're expanding to more universities. Drop
                                    your email and we'll notify you when Eastudy
                                    launches at your school.
                                </p>
                                <WaitlistForm />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-10 px-5 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-700 rounded-lg flex items-center justify-center">
                            <BookOpen size={13} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                            Eastudy
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">
                            ·
                        </span>
                        <span className="text-sm text-slate-400">
                            Built for Nigerian universities
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <Link
                            to="/auth/rep/signup"
                            className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                            Rep signup
                        </Link>
                        <Link
                            to="/auth/student/signup"
                            className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                            Student signup
                        </Link>
                        <Link
                            to="/auth/login"
                            className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>

                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} Eastudy
                    </p>
                </div>
            </footer>
        </div>
    );
}
