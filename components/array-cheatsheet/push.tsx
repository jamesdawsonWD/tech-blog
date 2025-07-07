"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "@/components/mdx/code-block";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

const fruitPool = ["🍎", "🍉", "🍌", "🍍", "🍊"];

function getRandomFruit() {
  return fruitPool[Math.floor(Math.random() * fruitPool.length)];
}

export default function PushDemo() {
  const [array, setArray] = useState<string[]>([]);
  const [codeLines, setCodeLines] = useState<string[]>(["const fruits = [🍌]"]);

  const pushFruit = () => {
    const newFruit = getRandomFruit();
    const newArray = [...array, newFruit];
    setArray(newArray);
    setCodeLines((prev) => [...prev, `fruits.push('${newFruit}')`]);
  };

  const popFruit = () => {
    if (array.length === 0) return;
    const poppedFruit = array[array.length - 1];
    const newArray = array.slice(0, -1);
    setArray(newArray);
    setCodeLines((prev) => [
      ...prev,
      `fruits.pop() // removed '${poppedFruit}'`,
    ]);
  };

  return (
    <>
      <div className="flex gap-2 min-h-[60px] items-end mb-4">
        <AnimatePresence initial={false}>
          {array.map((fruit, idx) => (
            <motion.div
              key={fruit + idx}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl p-2 bg-white rounded shadow"
            >
              {fruit}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <CodeBlock lang="js" showCopyButton={false} className="h-80">
        {codeLines.join("\n")}
      </CodeBlock>
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="secondary" onClick={pushFruit}>
          Push Fruit
        </Button>
        <Button size="sm" variant="secondary" onClick={popFruit}>
          Pop Fruit
        </Button>
      </div>
    </>
  );
}
