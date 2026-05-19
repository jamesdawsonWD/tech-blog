export default function WavyText({ text }: { text: string }) {
  return (
    <span
      aria-hidden="true"
      className="wavy-text inline-flex leading-none"
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{ ["--wavy-delay" as string]: `${i * 30}ms` }}
          className={
            char === " " ? "inline-block w-[0.25em]" : "wavy-letter inline-block"
          }
        >
          {char}
        </span>
      ))}
    </span>
  );
}
