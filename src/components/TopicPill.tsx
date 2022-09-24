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
  topic: string;
  onClick?: (topic: string) => void;
}

function TopicPill(props: Props) {
  const { topic } = props;
  const hash = hashCode(topic);
  const classes = `${
    colors[hash % colors.length]
  } px-[0.4rem] py-[0.1rem] md:px-[0.7rem] md:py-[0.2rem] rounded-full`;
  if (props.onClick !== undefined) {
    return (
      <button
        className={`${classes} hover:underline`}
        onClick={() => {
          props.onClick!(topic);
        }}
      >
        {topic}
      </button>
    );
  }
  return <div className={classes}>{topic}</div>;
}

export default React.memo(TopicPill);
