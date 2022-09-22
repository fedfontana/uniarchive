export default function Breadcrumbs({ path }: { path: string[] }) {
    return (
      <div className="bg-neutral-200 flex flex-row gap-2 px-3 py-2 rounded-lg text-lg">
        Navigation:
        <ul className="flex flex-row gap-2">
          {path.map((segment, idx) => {
            const urlSlug = path.slice(0, idx + 1).join("/");
            if (idx < path.length - 1) {
              return (
                <li key={`breadcrumb-${idx}`}>
                  <a
                    className="text-blue-700 hover:underline"
                    href={`/${urlSlug}`}
                  >
                    {segment}
                  </a>
                  {" > "}
                </li>
              );
            }
            return <li key={`breadcrumb-${idx}`}>{segment}</li>;
          })}
        </ul>
      </div>
    );
  }