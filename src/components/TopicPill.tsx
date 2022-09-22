import React from "react";

const colors = [
  "bg-red-500",
  "bg-orange-400",
  "bg-amber-400",
  "bg-yellow-800",
  "bg-lime-600",
  "bg-green-400",
  "bg-emerald-600",
  "bg-stone-400",
  "bg-teal-400",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-400",
  "bg-pink-500",
  "bg-rose-500",
];

const hashCode = (s: string) =>
  s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

interface Props {
    topic: string
}

function TopicPill({
  topic,
}: Props) {
    const hash = hashCode(topic)
  return (
    <div
      className={`${colors[hash % colors.length]} px-[0.7rem] py-[0.2rem] rounded-full`}
    >
      {topic}
    </div>
  );
}

export default React.memo(TopicPill)