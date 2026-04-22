import { useState } from "react";

interface ExpandableCellProps {
  children: React.ReactNode;
  className?: string;
}

const ExpandableCell = ({ children, className = "" }: ExpandableCellProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`cursor-pointer transition-all ${expanded ? "whitespace-normal break-words" : "truncate"} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setExpanded(!expanded);
      }}
      title={expanded ? "Click to collapse" : "Click to expand"}
    >
      {children}
    </div>
  );
};

export default ExpandableCell;
