"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils"; // adjust as needed
import { EyeIcon, HeartIcon, MailIcon, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function ArticleCard({ post }: { post: any }) {
  const [transition, setTransition] = useState(false);
  return (
    <div className="bg-foreground w-full h-full rounded-lg col-span-12">
      <AnimatePresence>
        <motion.div
          onClick={() => setTransition(true)}
          whileHover={{ x: -8, y: -8 }}
          transition={{ type: "spring", stiffness: 900, damping: 50 }}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="group relative bg-background p-6 flex rounded-lg before:absolute hover:border before:inset-0 before:rounded-lg before:z-0 hover:translate-x-[-8px] hover:translate-y-[-8px] z-10 transition-transform"
          >
            <div className="w-1/2 pr-12">
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p className="mt-2 text-muted-foreground">{post.description}</p>

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <Stat icon="eye" value={post.views} />
                <Stat icon="heart" value={post.likes} />
                <Stat icon="message-square" value={post.comments} />
              </div>

              <div className="flex items-center self-end gap-2 mt-20 text-sm text-muted-foreground mb-2">
                <Image
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span>{post.author.name}</span>
                <span>•</span>
                <span>{formatDate(post.date)}</span>
              </div>
            </div>

            {post.coverImage && (
              <motion.div
                className="w-1/2 relative"
                layoutId={`hero-${post.slug}`}
              >
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </motion.div>
            )}
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon, value }: { icon: string; value: number }) {
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
