import { EyeIcon, HeartIcon, MessageCircle } from "lucide-react";

export function Stat({ icon, value }: { icon: string; value: number }) {
    const icons = {
      eye: <EyeIcon width="16" height="16" />,
      heart: <HeartIcon width="16" height="16" />,
      "message-square": <MessageCircle width="16" height="16" />,
    };
  
    return (
      <div className="flex items-center gap-1">
        {icons[icon as keyof typeof icons]}
        <span>{value}</span>
      </div>
    );
  }