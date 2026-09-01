import { Clock, AlertTriangle, CheckCheck } from "lucide-react";

export default function AlertsSummary({
  pending,
  high,
  resolvedToday,
}: {
  pending: number;
  high: number;
  resolvedToday: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Alertas Pendientes</p>
          <p className="text-3xl font-bold text-gray-800">{pending}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
          <Clock className="w-6 h-6" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Severidad Alta</p>
          <p className="text-3xl font-bold text-red-600">{high}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Resueltas Hoy</p>
          <p className="text-3xl font-bold text-agrogreen-600">{resolvedToday}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-agrogreen-50 flex items-center justify-center text-agrogreen-600">
          <CheckCheck className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}