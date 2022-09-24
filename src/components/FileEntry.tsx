import { BaseFileData } from "$src/types";
import { useRouter } from "next/router";
import TopicPill from "$components/TopicPill";

export default function FileEntry({
  data,
  path,
  setQuery,
}: {
  data: BaseFileData;
  path: string[];
  setQuery: (query: string) => void;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-between mx-auto bg-neutral-300 dark:bg-neutral-800 py-3 px-4 rounded-lg w-full gap-3 transition-colors duration-500">
      {/* TOP SECTION -- FILE INFO */}
      <span className="flex flex-col gap-4 md:gap-0 items-start md:flex-row justify-between md:items-baseline">
        {/* FILE PATH */}
        <h3 className="text-sm font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
          file path: /{path.join("/")}/{data.filename}
        </h3>

        {/* LAST UPDATED */}
        {data?.frontmatter.lastUpdated && (
          <h3 className="text-sm font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
            last updated on {data?.frontmatter.lastUpdated}
          </h3>
        )}
      </span>
      {/* MIDDLE SECTION -- LECTURE INFO */}
      <span className="flex flex-row items-start md:items-center gap-6">
        <svg
          className="h-6 w-6 md:h-10 md:w-10 dark:fill-neutral-300 transition-colors duration-500"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M4 22v-20h16v11.543c0 4.107-6 2.457-6 2.457s1.518 6-2.638 6h-7.362zm18-7.614v-14.386h-20v24h10.189c3.163 0 9.811-7.223 9.811-9.614zm-5-1.386h-8v-1h8v1zm0-4h-8v1h8v-1zm0-3h-8v1h8v-1zm-9 0h-1v1h1v-1zm0 3h-1v1h1v-1zm0 3h-1v1h1v-1z" />
        </svg>
        <span className="flex flex-col md:flex-row items-baseline gap-2">
          {/* LECTURE NAME */}
          <h2 className="text-lg md:text-2xl font-sourcecodepro font-semibold">
            {data?.frontmatter.lecture?.title ?? "Unnamed Lecture"}
          </h2>
          {(data.frontmatter.lecture?.date ||
            data.frontmatter.lecture?.professor) && (
              <h3 className="text-lg font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
                held
                {data.frontmatter.lecture?.date &&
                  ` on ${data.frontmatter.lecture.date}`}
                {data.frontmatter.lecture?.professor && (
                  <span className="flex flex-row gap-2 items-baseline">
                    by
                    <button
                      onClick={() => {
                        setQuery(`prof:${data.frontmatter.lecture?.professor}`);
                      }}
                      className="hover:underline"
                    >
                      {data.frontmatter.lecture.professor}
                    </button>
                  </span>
                )}
              </h3>
          )}
        </span>
      </span>

      {/* BOTTOM SECTION -- TOPICS */}
      <span className="flex flex-col gap-4 md:gap-0 md:flex-row align-baseline justify-between">
        {data?.frontmatter.lecture?.topics &&
        data?.frontmatter.lecture?.topics.length > 0 ? (
          <div className="flex flex-row gap-4 items-center">
            <h4 className="md:text-lg font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
              Topics:
            </h4>
            <div className="flex flex-row gap-2">
              {data?.frontmatter.lecture.topics.map((topic, idx) => (
                <TopicPill
                  key={`topic-${idx}`}
                  topic={topic}
                  onClick={(topic) => {
                    setQuery(`topic:${topic}`);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div></div>
        )}
        <button
          className="self-end bg-blue-400 dark:bg-blue-600 px-2 py-1 md:px-4 md:py-2 rounded-md transition-colors duration-500"
          onClick={() => {
            router.push(`/${path.join("/")}/${data.filename}`);
          }}
        >
          show notes
        </button>
      </span>
    </div>
  );
}
