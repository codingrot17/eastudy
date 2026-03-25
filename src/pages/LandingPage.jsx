import { motion } from "framer-motion";
import {
    CalendarDays,
    BookOpen,
    Megaphone,
    Users,
    ClipboardList,
    Lightbulb,
    ArrowRight,
    GraduationCap
} from "lucide-react";
import Navbar from "../components/shared/Navbar";
import WaitlistForm from "../components/shared/WaitlistForm";
import Button from "../components/ui/Button";

// Animation helpers
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
};

// Data
const painPoints = [
    "Important announcements buried in 300-message chats",
    "Study materials scattered across multiple links",
    "No clear class schedule everyone can access",
    "Exam updates missed because of notification overload"
];

const features = [
    {
        icon: CalendarDays,
        title: "Class Schedule",
        desc: "Timetables and events in one shared calendar."
    },
    {
        icon: BookOpen,
        title: "Study Materials",
        desc: "Organized uploads accessible to your whole class."
    },
    {
        icon: Megaphone,
        title: "Announcements",
        desc: "Pinned updates from your rep, never buried."
    },
    {
        icon: ClipboardList,
        title: "Quizzes & Tests",
        desc: "Practice tests and assessments in one place."
    },
    {
        icon: Users,
        title: "Group Study",
        desc: "Coordinate study sessions with your classmates."
    },
    {
        icon: Lightbulb,
        title: "Study Plans",
        desc: "Personal and shared plans to stay on track."
    }
];

const steps = [
    {
        number: "01",
        title: "Rep Registers",
        desc: "The class rep creates a department and receives a unique code."
    },
    {
        number: "02",
        title: "Code is Shared",
        desc: "The rep shares the code with all students in the department."
    },
    {
        number: "03",
        title: "Students Join",
        desc: "Students sign up using the code and are instantly linked to their department."
    }
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <Navbar />

            {/* ── Hero ── */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="max-w-3xl mx-auto flex flex-col items-center gap-6"
                >
                    {/* Badge */}
                    <motion.div variants={fadeUp}>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium border border-primary-100 dark:border-primary-800">
                            <GraduationCap size={16} />
                            Launching at LASU first
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeUp}
                        className="text-4xl md:text-6xl font-extrabold leading-tight"
                    >
                        Student life,{" "}
                        <span className="bg-gradient-to-r from-primary-700 to-accent-500 bg-clip-text text-transparent">
                            finally organized
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeUp}
                        className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl"
                    >
                        Eastudy replaces your chaotic WhatsApp group with a
                        dedicated platform for schedules, materials,
                        announcements, and more.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-wrap gap-4 justify-center"
                    >
                        <Button
                            size="lg"
                            onClick={() =>
                                document
                                    .getElementById("waitlist")
                                    ?.scrollIntoView({ behavior: "smooth" })
                            }
                        >
                            Join the Waitlist{" "}
                            <ArrowRight size={18} className="ml-2" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() =>
                                document
                                    .getElementById("how-it-works")
                                    ?.scrollIntoView({ behavior: "smooth" })
                            }
                        >
                            See How It Works
                        </Button>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Problem ── */}
            <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-col gap-10"
                    >
                        <motion.div variants={fadeUp} className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Sound familiar?
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                Every student knows the struggle of the class
                                WhatsApp group.
                            </p>
                        </motion.div>

                        <motion.ul
                            variants={stagger}
                            className="grid md:grid-cols-2 gap-4"
                        >
                            {painPoints.map((point, i) => (
                                <motion.li
                                    key={i}
                                    variants={fadeUp}
                                    className="flex items-start gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700"
                                >
                                    <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                    <span className="text-slate-600 dark:text-slate-300">
                                        {point}
                                    </span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-col gap-12"
                    >
                        <motion.div variants={fadeUp} className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Everything your class needs
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                                Built around how university students actually
                                work and study.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {features.map(({ icon: Icon, title, desc }) => (
                                <motion.div
                                    key={title}
                                    variants={fadeUp}
                                    className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                                        <Icon
                                            size={20}
                                            className="text-primary-700 dark:text-primary-400"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        {title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        {desc}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section
                id="how-it-works"
                className="py-20 px-6 bg-slate-50 dark:bg-slate-900"
            >
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-col gap-12"
                    >
                        <motion.div variants={fadeUp} className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                How it works
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                Simple for reps. Effortless for students.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            className="grid md:grid-cols-3 gap-6"
                        >
                            {steps.map(({ number, title, desc }) => (
                                <motion.div
                                    key={number}
                                    variants={fadeUp}
                                    className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                                >
                                    <span className="text-4xl font-extrabold text-primary-100 dark:text-primary-900">
                                        {number}
                                    </span>
                                    <h3 className="font-bold text-lg">
                                        {title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        {desc}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Waitlist ── */}
            <section id="waitlist" className="py-24 px-6">
                <div className="max-w-xl mx-auto text-center">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-col gap-8"
                    >
                        <motion.div variants={fadeUp}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Be the first to know
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                We're launching at LASU soon. Join the waitlist
                                and we'll notify you the moment Eastudy goes
                                live.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <WaitlistForm />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-8 px-6 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary-700 rounded-md flex items-center justify-center">
                            <BookOpen size={12} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                            Eastudy
                        </span>
                    </div>
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} Eastudy — Learn with Ease
                    </p>
                </div>
            </footer>
        </div>
    );
}
