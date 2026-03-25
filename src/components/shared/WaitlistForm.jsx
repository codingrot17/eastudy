import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { joinWaitlist } from "../../appwrite/waitlist";
import Button from "../ui/Button";

export default function WaitlistForm() {
    const [form, setForm] = useState({
        email: "",
        role: "student",
        school: ""
    });
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [message, setMessage] = useState("");

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.email || !form.role) return;

        setStatus("loading");
        try {
            await joinWaitlist(form);
            setStatus("success");
            setMessage("You're on the list! We'll notify you at launch.");
        } catch (err) {
            if (err.message === "already_exists") {
                setStatus("error");
                setMessage("You're already on the waitlist!");
            } else {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        }
    };

    if (status === "success") {
        return (
            <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle size={48} className="text-accent-500" />
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    You're on the list!
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-center">
                    We'll notify you when Eastudy launches at LASU.
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full max-w-md mx-auto"
        >
            {/* Email */}
            <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
            />

            {/* Role */}
            <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
            >
                <option value="student">I'm a Student</option>
                <option value="rep">I'm a Class Rep</option>
            </select>

            {/* School (optional) */}
            <input
                type="text"
                name="school"
                placeholder="Your university (optional)"
                value={form.school}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
            />

            {/* Error message */}
            {status === "error" && (
                <p className="text-red-500 text-sm text-center">{message}</p>
            )}

            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <Loader2 size={20} className="animate-spin mr-2" />
                ) : null}
                {status === "loading" ? "Joining..." : "Notify Me at Launch"}
            </Button>

            <p className="text-xs text-slate-400 text-center">
                No spam. Just one email when we launch.
            </p>
        </form>
    );
}
