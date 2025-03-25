import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Pin, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface CACData {
  month: string;
  Google: number;
  Facebook: number;
  YouTube: number;
  LinkedIn: number;
}

const data: CACData[] = [
  {
    month: "January",
    Google: 45.2,
    Facebook: 38.7,
    YouTube: 52.1,
    LinkedIn: 67.3,
  },
  {
    month: "February",
    Google: 42.8,
    Facebook: 41.2,
    YouTube: 48.9,
    LinkedIn: 63.8,
  },
  {
    month: "March",
    Google: 47.5,
    Facebook: 36.9,
    YouTube: 55.2,
    LinkedIn: 70.1,
  },
  {
    month: "April",
    Google: 43.1,
    Facebook: 39.5,
    YouTube: 50.8,
    LinkedIn: 65.4,
  },
  {
    month: "May",
    Google: 46.7,
    Facebook: 37.8,
    YouTube: 53.4,
    LinkedIn: 68.9,
  },
  {
    month: "June",
    Google: 44.9,
    Facebook: 40.3,
    YouTube: 51.6,
    LinkedIn: 66.2,
  },
];

const colors = {
  Google: "#4285F4",
  Facebook: "#1877F2",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
};

export function DataVisualization() {
  const [isTable, setIsTable] = useState(true);
  const { toast } = useToast();

  const handlePinToDashboard = () => {
    toast({
      title: "Success",
      description: "Chart has been pinned to the dashboard",
      duration: 3000,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handlePinToDashboard}
          >
            <Pin className="h-4 w-4" />
            Pin to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Table</span>
            <Switch
              checked={!isTable}
              onCheckedChange={(checked) => setIsTable(!checked)}
            />
            <span className="text-sm text-muted-foreground">Graph</span>
          </div>
        </div>
      </div>

      <div className="transition-all duration-300">
        {isTable ? (
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Month</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Google</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Facebook</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">YouTube</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={row.month} className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                    <td className="py-3 px-4 text-sm">{row.month}</td>
                    <td className="py-3 px-4 text-sm">${row.Google}</td>
                    <td className="py-3 px-4 text-sm">${row.Facebook}</td>
                    <td className="py-3 px-4 text-sm">${row.YouTube}</td>
                    <td className="py-3 px-4 text-sm">${row.LinkedIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Google"
                  stroke={colors.Google}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Facebook"
                  stroke={colors.Facebook}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="YouTube"
                  stroke={colors.YouTube}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="LinkedIn"
                  stroke={colors.LinkedIn}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
} 