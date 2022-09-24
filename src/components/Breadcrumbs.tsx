import Link from "next/link";
import React from "react";

function Breadcrumbs({ path }: { path: string[] }) {
  return (
    <div className="bg-neutral-300 dark:bg-neutral-800 flex flex-row gap-2 px-3 py-2 rounded-lg text-lg transition-colors duration-500">
      &gt;
      <ul className="flex flex-row gap-2 flex-wrap">
        {path.map((segment, idx) => {
          const urlSlug = path.slice(0, idx + 1).join("/");
          if (idx < path.length - 1) {
            return (
              <li key={`breadcrumb-${idx}`}>
                <Link passHref href={`/${urlSlug}`}>
                  <a className="text-blue-500 hover:underline font-semibold">{segment}</a>
                </Link>
                {" > "}
              </li>
            );
          }
          return <li key={`breadcrumb-${idx}`} className="font-semibold">{segment}</li>;
        })}
      </ul>
    </div>
  );
}

export default React.memo(Breadcrumbs);
