import { BaseDirData } from "$src/types";
import { useRouter } from "next/router";

export default function DirectoryEntry({ data, path }: { data: BaseDirData; path: string[] }) {
    const router = useRouter();
  
    return (
      <div className="flex flex-col justify-between mx-auto bg-neutral-200 py-3 px-4 rounded-lg w-full gap-3">
        {/* TOP SECTION -- DIR PATH */}
        <h3 className="text-sm font-sourcecodepro text-neutral-600">
          directory path: /{path.join("/")}/{data.filename}
        </h3>
        <span className="flex flex-row justify-between">
          {/* DIR NAME */}
          <h2 className="text-2xl font-sourcecodepro font-semibold">
            {data.filename}
          </h2>
          {/* SHOW DIR BUTTON */}
          <button
            className="self-end bg-blue-400 px-4 py-2 rounded-md"
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