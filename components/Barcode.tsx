import React from "react";

interface BarcodeProps {
  className?: string;
  color?: string;
}

const Barcode: React.FC<BarcodeProps> = ({
  className,
  color = "currentColor",
}) => {
  // Generate random bars for a unique look each render (or could be seeded)
  const bars = Array.from({ length: 40 }).map((_, i) => ({
    width: Math.random() > 0.7 ? 4 : Math.random() > 0.4 ? 2 : 1,
    height: 40,
  }));

  return (
    <div
      className={`flex items-end justify-center gap-[2px] h-12 overflow-hidden ${className}`}
    >
      {bars.map((bar, idx) => (
        <div
          key={idx}
          style={{
            width: `${bar.width}px`,
            height: "100%", // Fill height
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};

export default Barcode;
