export type AlertSeverity = "high" | "medium" | "info";
export type AlertStatus = "pending" | "resolved";

export interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  nodeId: string;
  location: string;
  createdAt: string;
  resolvedAt?: string;
}