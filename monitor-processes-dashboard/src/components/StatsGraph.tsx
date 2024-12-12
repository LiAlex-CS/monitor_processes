import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";
import Container from "./Container";

export type GraphData = {
  x: string | number;
  y: number;
};

type StatsGraphProps = {
  header: string;
  currentValue: string | number;
  data: GraphData[];
};

const StatsGraph = ({ header, currentValue, data }: StatsGraphProps) => {
  const lastElementX = data[data.length - 1].x;

  return (
    <Container>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold">
          {header}: <span className=" font-medium">{currentValue}</span>
        </h2>
      </div>
      <div className="h-96">
        <ResponsiveContainer
          width="100%"
          height="100%"
          key={`rc_${lastElementX}`}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="x" />
            <YAxis />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUv)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Container>
  );
};

export default StatsGraph;
