import { AlertTriangle, BatteryWarning, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AlertSeverity = "high" | "medium" | "info";
export type AlertStatus = "pending" | "resolved";

export interface AlertItem {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  nodeId: string;
  location: string;
  time: string;
}

const severityConfig: Record<AlertSeverity, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
  high: { icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500" },
  medium: { icon: BatteryWarning, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  info: { icon: RefreshCw, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
};

const statusConfig: Record<AlertStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  resolved: "bg-agrogreen-100 text-agrogreen-700",
};

export default function AlertRow({ alert }: { alert: AlertItem }) {
  const sev = severityConfig[alert.severity];
  const Icon = sev.icon;

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-full ${sev.iconBg} flex items-center justify-center ${sev.iconColor} flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{alert.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {alert.nodeId} · {alert.location} · {alert.time}
        </p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[alert.status]}`}>
        {alert.status === "pending" ? "Pendiente" : "Resuelta"}
      </span>
    </div>
  );
}