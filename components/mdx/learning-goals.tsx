"use client";

import { Badge } from "@/components/ui/badge";

interface Goal {
  text: string;
  badge?: string;
}

interface LearningGoalsProps {
  goals: Goal[];
}

export default function LearningGoals({ goals }: LearningGoalsProps) {
  return (
    <div className="border border-border rounded-lg px-6 pb-4 mb-8 bg-muted/20">
      <h2 className="text-lg font-semibold mb-4">What you'll learn</h2>
      <ul className="space-y-4">
        {goals.map((goal, idx) => (
          <li
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center sm:gap-2"
          >
            <span className="list-item list-disc list-inside">{goal.text}</span>
            {goal.badge && <Badge>{goal.badge}</Badge>}
          </li>
        ))}
      </ul>
    </div>
  );
}
