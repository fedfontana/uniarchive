import { BaseDirData } from "$src/types";
import { useRouter } from "next/router";

export default function DirectoryEntry({ data, path }: { data: BaseDirData; path: string[] }) {
    const router = useRouter();
  
    return (
      <div className="flex flex-col justify-between mx-auto bg-neutral-300 dark:bg-neutral-800 py-3 px-4 rounded-lg w-full gap-3 transition-colors duration-500">
        {/* TOP SECTION -- DIR PATH */}
        <h3 className="text-sm font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
          directory path: /{path.join("/")}/{data.filename}
        </h3>
        <span className="flex flex-row justify-between">
          {/* DIR NAME */}
          <h2 className="text-2xl font-sourcecodepro font-semibold">
            {data.filename}
          </h2>
          {/* SHOW DIR BUTTON */}
          <button
            className="self-end bg-blue-400 dark:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-500"
            onClick={() => {
              router.push(`/${path.join("/")}/${data.filename}`);
            }}
          >
            show directory
          </button>
        </span>
      </div>
    );
  }