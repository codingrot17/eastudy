import { createContext, useContext, useEffect, useState } from "react";
import { usePWA } from "../../hooks/usePWA";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    X,
    Bell,
    BellOff,
    Smartphone,
    Share,
    Plus
} from "lucide-react";

const PWAContext = createContext(null);

export function usePWAContext() {
    return useContext(PWAContext);
}

// ── iOS detection helpers ────────────────────────
function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isInStandaloneMode() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

export default function PWAProvider({ children }) {
    const pwa = usePWA();
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [showNotifPrompt, setShowNotifPrompt] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(
        () => sessionStorage.getItem("install-banner-dismissed") === "true"
    );
    const [iosDismissed, setIosDismissed] = useState(
        () => sessionStorage.getItem("ios-prompt-dismissed") === "true"
    );

    // Android/Desktop: show banner after 3s if installable
    useEffect(() => {
        if (pwa.canInstall && !bannerDismissed) {
            const t = setTimeout(() => setShowInstallBanner(true), 3000);
            return () => clearTimeout(t);
        }
    }, [pwa.canInstall, bannerDismissed]);

    // iOS: show guide after 4s if not installed and not dismissed
    useEffect(() => {
        if (isIOS() && !isInStandaloneMode() && !iosDismissed) {
            const t = setTimeout(() => setShowIOSGuide(true), 4000);
            return () => clearTimeout(t);
        }
    }, [iosDismissed]);

    // Notification prompt — show after install banner is gone (or after 10s)
    useEffect(() => {
        if (
            pwa.notifPermission === "default" &&
            !showInstallBanner &&
            !showIOSGuide
        ) {
            const t = setTimeout(() => setShowNotifPrompt(true), 10000);
            return () => clearTimeout(t);
        }
    }, [pwa.notifPermission, showInstallBanner, showIOSGuide]);

    const dismissBanner = () => {
        setShowInstallBanner(false);
        setBannerDismissed(true);
        sessionStorage.setItem("install-banner-dismissed", "true");
    };

    const dismissIOS = () => {
        setShowIOSGuide(false);
        setIosDismissed(true);
        sessionStorage.setItem("ios-prompt-dismissed", "true");
    };

    const handleInstall = async () => {
        const accepted = await pwa.install();
        if (accepted) {
            setShowInstallBanner(false);
            setTimeout(() => setShowNotifPrompt(true), 2000);
        }
    };

    const handleEnableNotifs = async () => {
        await pwa.requestNotifPermission();
        setShowNotifPrompt(false);
    };

    return (
        <PWAContext.Provider
            value={{ ...pwa, setShowInstallBanner, setShowNotifPrompt }}
        >
            {children}

            {/* ── Android/Desktop Install Banner ── */}
            <AnimatePresence>
                {showInstallBanner && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 200
                        }}
                        className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50"
                    >
                        <div className="bg-[#1E1B4B] text-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-4 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Smartphone
                                        size={24}
                                        className="text-cyan-400"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm leading-tight">
                                        Install Eastudy
                                    </p>
                                    <p className="text-xs text-indigo-300 mt-1">
                                        Get instant notifications for
                                        announcements, works offline, no app
                                        store needed.
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={handleInstall}
                                            disabled={pwa.isInstalling}
                                            className="flex items-center gap-2 bg-white text-[#1E1B4B] text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-60"
                                        >
                                            <Download size={14} />
                                            {pwa.isInstalling
                                                ? "Installing..."
                                                : "Install App"}
                                        </button>
                                        <button
                                            onClick={dismissBanner}
                                            className="text-xs text-indigo-300 hover:text-white transition-colors px-2 py-2"
                                        >
                                            Not now
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={dismissBanner}
                                    className="p-1 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="h-0.5 bg-gradient-to-r from-cyan-400 to-primary-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── iOS "Add to Home Screen" Guide ── */}
            <AnimatePresence>
                {showIOSGuide && (
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 22,
                            stiffness: 200
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6"
                    >
                        <div className="bg-[#1E1B4B] text-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-cyan-400 to-indigo-400" />
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                            <img
                                                src="/favicon.svg"
                                                alt="Eastudy"
                                                className="w-8 h-8"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">
                                                Install Eastudy
                                            </p>
                                            <p className="text-xs text-indigo-300 mt-0.5">
                                                Add to your home screen for the
                                                best experience
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={dismissIOS}
                                        className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors ml-2 shrink-0"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <IOSStep
                                        num={1}
                                        icon={
                                            <Share
                                                size={15}
                                                className="text-cyan-400"
                                            />
                                        }
                                        text={
                                            <>
                                                Tap the <strong>Share</strong>{" "}
                                                <span className="text-cyan-300 font-mono">
                                                    ⬆
                                                </span>{" "}
                                                button in Safari's toolbar
                                            </>
                                        }
                                    />
                                    <IOSStep
                                        num={2}
                                        icon={
                                            <Plus
                                                size={15}
                                                className="text-cyan-400"
                                            />
                                        }
                                        text={
                                            <>
                                                Scroll down and tap{" "}
                                                <strong>
                                                    "Add to Home Screen"
                                                </strong>
                                            </>
                                        }
                                    />
                                    <IOSStep
                                        num={3}
                                        icon={
                                            <span className="text-cyan-400 text-xs font-bold">
                                                ✓
                                            </span>
                                        }
                                        text="Tap Add — Eastudy will launch like a native app!"
                                    />
                                </div>

                                <button
                                    onClick={dismissIOS}
                                    className="w-full mt-4 py-2 text-xs text-indigo-400 hover:text-indigo-200 transition-colors"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Notification Permission Prompt ── */}
            <AnimatePresence>
                {showNotifPrompt && pwa.notifPermission === "default" && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 200
                        }}
                        className="fixed top-4 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                    <Bell
                                        size={20}
                                        className="text-primary-700 dark:text-primary-400"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                        Never miss an update
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Get notified instantly for announcements
                                        and schedule changes.
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={handleEnableNotifs}
                                            className="flex items-center gap-1.5 bg-primary-700 hover:bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                                        >
                                            <Bell size={13} />
                                            Enable Notifications
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowNotifPrompt(false)
                                            }
                                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-2 transition-colors"
                                        >
                                            Later
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowNotifPrompt(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PWAContext.Provider>
    );
}

function IOSStep({ num, icon, text }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                {icon}
            </div>
            <p className="text-sm text-indigo-200 flex-1">{text}</p>
        </div>
    );
}
