"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "@/components/mdx/code-block";

const fruits = [
  "\ud83c\udf4e",
  "\ud83c\udf49",
  "\ud83c\udf4c",
  "\ud83c\udf4d",
  "\ud83c\udf4a",
]; // apple, watermelon, banana, pineapple, tangerine

function getRandomFruit() {
  return fruits[Math.floor(Math.random() * fruits.length)];
}

export default function IncludesDemo() {
  const [array, setArray] = useState<string[]>([]);
  const [includesBanana, setIncludesBanana] = useState(false);

  const handleAdd = () => {
    const newFruit = getRandomFruit();
    const newArray = [...array, newFruit];
    setArray(newArray);
    setIncludesBanana(newArray.includes("\ud83c\udf4c"));
  };

  const handlePop = () => {
    const newArray = array.slice(0, -1);
    setArray(newArray);
    setIncludesBanana(newArray.includes("\ud83c\udf4c"));
  };

  const handleCheck = () => {
    setIncludesBanana(array.includes("\ud83c\udf4c"));
  };

  const codeString = `const fruits = [${array.map((f) => `'${f}'`).join(", ")}]
const hasBanana = fruits.includes('\ud83c\udf4c') // ${includesBanana}`;

  return (
    <>
      <CodeBlock lang="js" showCopyButton={false}>{codeString}</CodeBlock>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={handleAdd}>
          Add Fruit
        </Button>
        <Button size="sm" variant="secondary" onClick={handlePop}>
          Remove Fruit
        </Button>
      </div>
    </>
  );
}
