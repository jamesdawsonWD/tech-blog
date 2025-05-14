export function ConicGradient() {
  return (
    <div className="w-full flex items-center justify-center my-20">
      <div
        className="basic-conic w-80 h-80 rounded-xl"
        style={{
          background: "conic-gradient(red, orange, yellow, green, blue)",
        }}
      ></div>
    </div>
  );
}
