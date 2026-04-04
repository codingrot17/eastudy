import { ShieldCheck, Shield } from "lucide-react";
import useAuthStore from "../../../store/useAuthStore";

export default function AssistantSettingsTab({ department, user }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-extrabold">Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Your account and department info
                </p>
            </div>

            {/* Role Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-primary-50 dark:from-cyan-900/20 dark:to-primary-900/20 rounded-2xl border border-cyan-100 dark:border-cyan-800 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-primary-700 flex items-center justify-center shrink-0">
                    <span className="text-white font-extrabold text-lg">
                        {user?.name?.[0]?.toUpperCase() ?? "A"}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{user?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-1">
                        <ShieldCheck size={12} />
                        Assistant Class Rep
                    </span>
                </div>
            </div>

            {/* Department Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <Shield
                            size={20}
                            className="text-primary-700 dark:text-primary-400"
                        />
                    </div>
                    <div>
                        <p className="font-bold">Department Info</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Your registered department
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        ["Department", department?.name],
                        ["School", department?.school],
                        ["Level", department?.level],
                        ["Session", department?.session]
                    ].map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-0.5">
                            <p className="text-xs text-slate-400">{key}</p>
                            <p className="font-semibold text-sm">{val}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notice */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center flex flex-col items-center gap-2">
                <ShieldCheck size={24} className="text-slate-400" />
                <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">
                    You have assistant rep access
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                    You can post announcements, add materials, and manage the
                    class schedule. Only the main rep can assign or remove
                    assistant reps.
                </p>
            </div>
        </div>
    );
}
