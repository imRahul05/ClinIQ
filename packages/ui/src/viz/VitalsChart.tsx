import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";

export interface VitalPoint {
  date: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  glucose?: number;
  weight?: number;
  [key: string]: string | number | undefined;
}

export interface VitalsChartProps {
  title: string;
  data: VitalPoint[];
  metricType: "blood-pressure" | "heart-rate" | "glucose" | "weight";
}

export function VitalsChart({ title, data, metricType }: VitalsChartProps) {
  return (
    <Card notch className="w-full bg-[var(--paper-raised)] border-[var(--line)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-[var(--ink)]">{title}</CardTitle>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-faint)]">
            TELEMETRY · CONTINUOUS
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-[var(--line)]" />
              <XAxis dataKey="date" stroke="currentColor" className="text-[var(--ink-muted)]" fontSize={10} fontFamily="monospace" tickLine={false} />
              <YAxis stroke="currentColor" className="text-[var(--ink-muted)]" fontSize={10} fontFamily="monospace" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#141412",
                  borderColor: "#333330",
                  borderRadius: "4px",
                  color: "#f4f4f0",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", paddingTop: "8px" }} />

              {metricType === "blood-pressure" && (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic (mmHg)"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: "#f43f5e" }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic (mmHg)"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: "#6366f1" }}
                    activeDot={{ r: 4 }}
                  />
                </>
              )}

              {metricType === "heart-rate" && (
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (bpm)"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "#10b981" }}
                />
              )}

              {metricType === "glucose" && (
                <Line
                  type="monotone"
                  dataKey="glucose"
                  name="Glucose (mg/dL)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "#f59e0b" }}
                />
              )}

              {metricType === "weight" && (
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (lbs)"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "#8b5cf6" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


