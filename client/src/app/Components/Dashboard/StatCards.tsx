import React from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

export interface StatCard {
  title: string;
  value: number | string;
  pilltext: string;
  trend: "Up" | "down";
  period: string;
}

interface StatCardsProps {
  stats: StatCard[];
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  return (
    <>
      {stats.map((stat, index) => (
        <Card
          key={index}
          title={stat.title}
          value={stat.value}
          pilltext={stat.pilltext}
          trend={stat.trend}
          period={stat.period}
        />
      ))}
    </>
  );
};

export const Card = ({
  title,
  value,
  pilltext,
  trend,
  period,
}: StatCard) => {
  return (
    <div className="p-4 col-span-3 rounded border border-stone-300">
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-sm text-stone-500 mb-2">{title}</h3>
          <p className="text-3xl font-semibold">{value}</p>
        </div>
        <span
          className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded ${
            trend === "Up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {trend === "Up" ? <FiTrendingUp /> : <FiTrendingDown />} {pilltext}
        </span>
      </div>
      <a className="text-xs text-stone-500">{period}</a>
    </div>
  );
};

export default StatCards;
