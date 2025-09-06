// src/components/charts/AccuracyChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  agent: string;
  accuracy: number;
  annotations: number;
}

interface AccuracyChartProps {
  data: ChartData[];
}

const AccuracyChart = ({ data }: AccuracyChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Précision par Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="agent" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, "Précision"]} />
            <Bar dataKey="accuracy" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AccuracyChart;