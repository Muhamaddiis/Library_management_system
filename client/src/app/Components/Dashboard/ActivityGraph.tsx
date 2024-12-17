"use client";

import React from "react";
import { FiBookOpen } from "react-icons/fi";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts"

// Custom data for library usage over months
const data = [
  {
    name: "Jan",
    Borrowed: 200,
    Returned: 180,
  },
  {
    name: "Feb",
    Borrowed: 250,
    Returned: 240,
  },
  {
    name: "Mar",
    Borrowed: 300,
    Returned: 280,
  },
  {
    name: "Apr",
    Borrowed: 220,
    Returned: 200,
  },
  {
    name: "May",
    Borrowed: 270,
    Returned: 260,
  },
  {
    name: "Jun",
    Borrowed: 320,
    Returned: 310,
  },
  {
    name: "Jul",
    Borrowed: 290,
    Returned: 280,
  },
];

const ActivityGraph = () => {
  return (
    <div className="col-span-8 overflow-hidden rounded border border-stone-300">
      <div className="p-4">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiBookOpen /> Monthly Activity
        </h3>
      </div>

      <div className="h-64 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: -24,
              bottom: 0,
            }}
          >
            <CartesianGrid stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs font-bold"
              padding={{ right: 4 }}
            />
            <YAxis
              className="text-xs font-bold"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              wrapperClassName="text-sm rounded"
              labelClassName="text-xs text-stone-500"
            />
            <Line
              type="monotone"
              dataKey="Borrowed"
              stroke="#18181b"
              fill="#18181b"
            />
            <Line
              type="monotone"
              dataKey="Returned"
              stroke="#5b21b6"
              fill="#5b21b6"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityGraph;
