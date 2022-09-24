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
      <span className="flex flex-row justify-between items-baseline">
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
      <span className="flex flex-row items-center gap-6">
        <svg
          className="h-10 w-10 dark:fill-neutral-300 transition-colors duration-500"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M4 22v-20h16v11.543c0 4.107-6 2.457-6 2.457s1.518 6-2.638 6h-7.362zm18-7.614v-14.386h-20v24h10.189c3.163 0 9.811-7.223 9.811-9.614zm-5-1.386h-8v-1h8v1zm0-4h-8v1h8v-1zm0-3h-8v1h8v-1zm-9 0h-1v1h1v-1zm0 3h-1v1h1v-1zm0 3h-1v1h1v-1z" />
        </svg>
        <span className="flex flex-row items-baseline gap-2">
          {/* LECTURE NAME */}
          {data?.frontmatter.lecture?.title ? (
            <span className="flex flex-row gap-2 items-baseline">
              <h2 className="text-lg font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
                Lecture{" "}
              </h2>
              <h2 className="text-2xl font-sourcecodepro font-semibold">
                {data?.frontmatter.lecture.title}
              </h2>
            </span>
          ) : (
            <h2 className="text-2xl font-sourcecodepro font-semibold">
              Unnamed lecture
            </h2>
          )}
          {(data.frontmatter.lecture?.date ||
            data.frontmatter.lecture?.professor) && (
            <h3 className="text-lg font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
              held
            </h3>
          )}

          {/* LECTURE DATE AND PROFESSOR */}
          {data.frontmatter.lecture?.date && (
            <h3 className="text-lg font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
              on {data.frontmatter.lecture.date}
            </h3>
          )}
          {data.frontmatter.lecture?.professor && (
            <h3 className="text-lg font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
              by{" "}
              <button
                onClick={() => {
                  setQuery(`prof:${data.frontmatter.lecture?.professor}`);
                }}
                className="hover:underline"
              >
                {data.frontmatter.lecture.professor}
              </button>
            </h3>
          )}
        </span>
      </span>

      {/* BOTTOM SECTION -- TOPICS */}
      <span className="flex flex-row align-baseline justify-between">
        {data?.frontmatter.lecture?.topics &&
        data?.frontmatter.lecture?.topics.length > 0 ? (
          <div className="flex flex-row gap-4 items-center">
            <h4 className="text-lg font-sourcecodepro text-neutral-600 dark:text-neutral-300 transition-colors duration-500">
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
          className="self-end bg-blue-400 dark:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-500"
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
