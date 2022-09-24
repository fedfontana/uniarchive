import { BaseDirData } from "$src/types";
import { useRouter } from "next/router";

export default function DirectoryEntry({
  data,
  path,
}: {
  data: BaseDirData;
  path: string[];
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between mx-auto bg-neutral-300 dark:bg-neutral-800 py-3 px-4 rounded-lg w-full gap-3 transition-colors duration-500">
      {/* TOP SECTION -- DIR PATH */}
      <h3 className="text-sm font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
        directory path: /{path.join("/")}/{data.filename}
      </h3>
      <span className="flex flex-row justify-between">
        <span className="flex flex-row gap-6 items-center">
          <svg
            className="w-6 h-6 md:w-10 md:h-10 dark:fill-neutral-300 transition-colors duration-500"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M0 10v12h24v-12h-24zm22 10h-20v-8h20v8zm-22-12v-6h7c1.695 1.942 2.371 3 4 3h13v3h-2v-1h-11c-2.34 0-3.537-1.388-4.916-3h-4.084v4h-2z" />
          </svg>
          {/* DIR NAME */}
          <h2 className="text-lg md:text-2xl font-sourcecodepro font-semibold">
            {data.filename}
          </h2>
        </span>
        {/* SHOW DIR BUTTON */}
        <button
          className="self-end bg-blue-400 dark:bg-blue-600 px-2 py-1 md:px-4 md:py-2 rounded-md transition-colors duration-500"
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
