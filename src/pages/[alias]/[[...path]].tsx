/* eslint-disable @next/next/no-page-custom-font */
import {
  DirData,
  FileData,
  Repository,
  TreeEntry,
  BaseDirData,
  BaseFileData,
  DataEntry,
  FrontmatterOptions,
  MarkdownFile,
} from "$src/types";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import frontMatter from "front-matter";
import Markdown from "$components/Markdown";
import TopicPill from "$src/components/TopicPill";
import { Router, useRouter } from "next/router";
import { ReactNode, useEffect, useRef, useState } from "react";

interface SuccessProps {
  error: false;
  data: DirData | FileData;
}
interface FailureProps {
  error: true;
  cause: string; //TODO more fine grained type
}

type Props = SuccessProps | FailureProps;

const useFocus = () => {
  const htmlElRef = useRef<any>(null);
  const setFocus = () => {
    htmlElRef.current?.focus();
  };

  return [htmlElRef, setFocus];
};

const PathPage: InferGetServerSidePropsType<typeof getServerSideProps> = (
  props: Props
) => {
  const router = useRouter();
  const [inputRef, setInputFocus] = useFocus();

  const [query, setQuery] = useState(
    router.query.query !== undefined
      ? router.query.query instanceof Array
        ? router.query.query[0]
        : router.query.query
      : ""
  );

  useEffect(() => {
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        (setInputFocus as any)();
      }
    });
  }, [inputRef, setInputFocus]);

  if (props.error) {
    return <div>an error occurred. Cause: {props.cause}</div>;
  }

  //TODo add sort options next to the search box
  // - directories first (on by default)
  // - last updated
  // - held on

  //TODO ctrl+k focuses search box
  //TODO add debounce to search

  const { data } = props;

  if (data.isDir) {
    const files = data.files.filter((entry) => {
      const q = query!.toLowerCase().trim();
      const filename = !entry.isDir
        ? entry.filename.toLowerCase().slice(0, entry.filename.length - 3)
        : entry.filename.toLowerCase(); // remove .md extension
      if (q.startsWith("topic:")) {
        if (entry.isDir) return false;
        if (
          !entry.frontmatter.lecture?.topics ||
          entry.frontmatter.lecture?.topics.length < 1
        )
          return false;
        return (
          entry.frontmatter.lecture.topics.find((topic) =>
            topic.toLowerCase().trim().includes(q.slice(6))
          ) !== undefined
        );
      } else if (q.startsWith("title:")) {
        if (entry.isDir) return false;
        if (!entry.frontmatter.lecture?.title) return false;
        return (
          entry.frontmatter.lecture.title
            .toLowerCase()
            .trim()
            .includes(q.slice(6)) !== undefined
        );
      } else if (q.startsWith("prof:")) {
        if (entry.isDir) return false;
        if (!entry.frontmatter.lecture?.professor) return false;
        return (
          entry.frontmatter.lecture.professor
            .toLowerCase()
            .trim()
            .includes(q.slice(5)) !== undefined
        );
      } else if (q.startsWith("dir:")) {
        if (!entry.isDir) return false;
        return filename.includes(q.slice(4));
      } else if (q.startsWith("file:")) {
        if (entry.isDir) return false;
        return filename.includes(q.slice(5));
      } else {
        if (entry.isDir) {
          return filename.includes(q);
        }
        const { frontmatter } = entry;
        if (
          frontmatter.lecture?.topics &&
          frontmatter.lecture?.topics.length > 0
        ) {
          if (
            frontmatter.lecture.topics.find((topic) =>
              topic.toLowerCase().trim().includes(q)
            ) !== undefined
          ) {
            return true;
          }
        }
        if (frontmatter.lecture?.title) {
          if (
            frontmatter.lecture.title.toLowerCase().trim().includes(q) !==
            undefined
          ) {
            return true;
          }
        }
        if (frontmatter.lecture?.professor) {
          if (
            frontmatter.lecture.professor.toLowerCase().trim().includes(q) !==
            undefined
          ) {
            return true;
          }
        }
        return filename.includes(q);
      }
    });

    //TODO add tooltips to buttons
    //TODO add keyboard shortcut hint in input elem
    return (
      <div>
        <div className="my-6">
          <Breadcrumbs path={data.path} />
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-24 mb-6">
          <div className="flex flex-row gap-2 flex-grow">
            <input
              ref={inputRef}
              autoFocus
              type="text"
              placeholder="Search notes..."
              className="bg-neutral-200 px-6 py-2 rounded-lg flex-shrink flex-grow min-w-[10rem] w-[80%]"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
            <button className="h-12 min-w-12 w-12 bg-neutral-200 rounded-lg">S</button>
          </div>
          <div className="flex flex-row gap-2">
            <button className="h-12 w-12 bg-neutral-200 rounded-lg">C</button>
            <button className="h-12 w-12 bg-neutral-200 rounded-lg">D</button>
            <button className="h-12 w-12 bg-neutral-200 rounded-lg">E</button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {files.map((entry, idx) => {
            if (entry.isDir) {
              return (
                <DirectoryEntry
                  key={`directory-${idx}`}
                  data={entry}
                  path={data.path}
                />
              );
            }
            return (
              <FileEntry
                key={`file-${idx}`}
                data={entry}
                path={data.path}
                setQuery={setQuery}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const frontMatterNotEmpty =
    data.content.frontmatter.lastUpdated !== undefined ||
    data.content.frontmatter.lecture?.date !== undefined ||
    data.content.frontmatter.lecture?.title !== undefined ||
    data.content.frontmatter.lecture?.professor !== undefined ||
    (data.content.frontmatter.lecture?.topics !== undefined &&
      data.content.frontmatter.lecture?.topics.length > 0);

  return (
    <div>
      <div className="mb-4">
        <Breadcrumbs path={data.path} />
      </div>
      {frontMatterNotEmpty && (
        <FrontmatterSection frontmatter={data.content.frontmatter} />
      )}

      <div className="h-8"></div>

      <article
        className="pb-10 md:pb-20 mt-20 md:mt-0 max-w-none
          w-10/12 mx-auto
          font-sourcecodepro
          prose prose-md md:prose-xl prose-neutral dark:prose-invert 
          prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
          prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:text-center md:prose-h1:text-left 
          prose-h2:text-3xl md:prose-h2:text-4xl 
          prose-h3:text-2xl md:prose-h3:text-3xl
          prose-h4:text-xl md:prose-h4:text-2xl 
          prose-h5:text-lg md:prose-h5:text-xl 
          prose-h6:text-md md:prose-h6:text-lg
          prose-p:leading-8 
          prose-li:leading-6 prose-li:marker:text-neutral-500 dark:prose-li:marker:text-neutral-400
          prose-img:mx-auto
          prose-table:shadow-md dark:prose-table:shadow-neutral-900 prose-table:border-[.01rem] prose-table:border-neutral-200 dark:prose-table:border-neutral-700
          prose-th:text-center prose-th:py-6 prose-th:bg-gray-100 prose-th:text-gray-600 dark:prose-th:text-neutral-200 dark:prose-th:bg-neutral-800
          hover:prose-tr:bg-gray-200 dark:hover:prose-tr:bg-neutral-700
          prose-td:text-center
          prose-figure:flex prose-figure:flex-col prose-figure:items-center
          prose-figcaption:text-inherit prose-figcaption:text-center prose-figcaption:w-[80%]
          "
      >
        <Markdown content={(props.data as FileData).content.body} />
      </article>
    </div>
  );
};

export default PathPage;

function Breadcrumbs({ path }: { path: string[] }) {
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

function DirectoryEntry({ data, path }: { data: BaseDirData; path: string[] }) {
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

//TODO refactor components
//TODO add help button that shows keyboard shortcuts and search filters onClick
//TODO pass repository to page and show "show on github/gitlab" button with matching icon
//TODO show course name

function FileEntry({
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
    <div className="flex flex-col justify-between mx-auto bg-neutral-200 py-3 px-4 rounded-lg w-full gap-3">
      {/* TOP SECTION -- FILE INFO */}
      <span className="flex flex-row justify-between items-baseline">
        {/* FILE PATH */}
        <h3 className="text-sm font-sourcecodepro text-neutral-600">
          file path: /{path.join("/")}/{data.filename}
        </h3>
        {/* LAST UPDATED */}
        {data?.frontmatter.lastUpdated && (
          <h3 className="text-sm font-sourcecodepro text-neutral-600">
            notes last updated on {data?.frontmatter.lastUpdated}
          </h3>
        )}
      </span>
      {/* MIDDLE SECTION -- LECTURE INFO */}
      <span className="flex flex-row items-baseline gap-2">
        {/* LECTURE NAME */}
        {data?.frontmatter.lecture?.title ? (
          <span className="flex flex-row gap-2 items-baseline">
            <h2 className="text-lg font-sourcecodepro text-neutral-600">
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
          <h3 className="text-lg font-sourcecodepro text-neutral-600">held</h3>
        )}

        {/* LECTURE DATE AND PROFESSOR */}
        {data.frontmatter.lecture?.date && (
          <h3 className="text-lg font-sourcecodepro text-neutral-600">
            on {data.frontmatter.lecture.date}
          </h3>
        )}
        {data.frontmatter.lecture?.professor && (
          <h3 className="text-lg font-sourcecodepro text-neutral-600">
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

      {/* BOTTOM SECTION -- TOPICS */}
      <span className="flex flex-row align-baseline justify-between">
        {data?.frontmatter.lecture?.topics &&
        data?.frontmatter.lecture?.topics.length > 0 ? (
          <div className="flex flex-row gap-4 items-center">
            <h4 className="text-lg font-sourcecodepro text-neutral-600">
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
          className="self-end bg-blue-400 px-4 py-2 rounded-md"
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
//TODO home page with list of tracked repositories
//TODO add icons to buttons
//TODO functioning dark them switch
//TODO mobile

function FrontmatterSection({
  frontmatter,
}: {
  frontmatter: FrontmatterOptions;
}) {
  return (
    <span className="flex flex-row items-baseline justify-between mx-auto bg-neutral-200 py-3 px-4 rounded-lg">
      {/* LEFT SECTION */}
      <div className="flex flex-col gap-2">
        {/* TOP LECTURE SECTION */}
        <span className="flex flex-row items-baseline gap-2">
          {frontmatter.lecture?.title ? (
            <span className="flex flex-row gap-2 items-baseline">
              <h2 className="text-lg font-sourcecodepro text-neutral-600">
                Lecture{" "}
              </h2>
              <h2 className="text-2xl font-sourcecodepro font-semibold">
                {frontmatter.lecture.title}
              </h2>
            </span>
          ) : (
            <h2 className="text-2xl font-sourcecodepro font-semibold">
              Unnamed lecture
            </h2>
          )}
          {(frontmatter.lecture?.date || frontmatter.lecture?.professor) && (
            <h3 className="text-lg font-sourcecodepro text-neutral-600">
              held
              {frontmatter.lecture?.date && ` on ${frontmatter.lecture.date}`}
              {frontmatter.lecture?.professor &&
                ` by ${frontmatter.lecture.professor}`}
            </h3>
          )}
        </span>

        {/* BOTTOM LECTURE SECTION (TOPICS) */}
        {frontmatter.lecture?.topics && frontmatter.lecture?.topics.length > 0 && (
          <div className="flex flex-row gap-4 items-center">
            <h4 className="text-lg font-sourcecodepro text-neutral-600">
              Topics:
            </h4>
            <div className="flex flex-row gap-2">
              {frontmatter.lecture.topics.map((topic, idx) => (
                <TopicPill key={`topic-${idx}`} topic={topic} />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* RIGHT SECTION */}
      {frontmatter.lastUpdated && (
        <h3 className="text-lg font-sourcecodepro text-neutral-900 font-semibold">
          Notes last updated on {frontmatter.lastUpdated}
        </h3>
      )}
    </span>
  );
}

const repos: Repository[] = [
  {
    provider: "github.com", // optional provider. Defaults to github. Supports github and gitlab.
    username: "fedfontana",
    repo: "prova_md", // this will look at github.com/fedfontana/vcc. Make sure that this repo is public!
    alias: "prova_md", // optional new name for the repository. Must be unique between all of the repos listed.  Defaults to the value of "repo". Useful when two repos from different users have the same name. This gets used in the url.
    courseName: "Virtualization and Cloud Computing", // optional long name of the course
    branch: "master", // optional branch name. Defaults to main
    ignoreFileNames: ["README.md"], // optional list of ignored file names (case insensitive). Defaults to ["README.md"]. If you want to include readmes, just pass [] as option
    baseDirectory: "",
  },
];

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const alias = query.alias as string;
  const path = query.path as string[] | undefined;

  // if path === undefined, then full repo request
  // if path instanceof Array, then there is a path

  let repo = repos.find((repo) => repo.alias === alias || repo.repo === alias);
  if (repo === undefined) {
    return {
      props: {
        error: true,
        cause: "REPO NOT FOUND",
      },
    };
  }

  try {
    const tree = await getValidRepoTree(repo);
    let data = await getData(tree, repo, path);
    return {
      props: {
        error: false,
        data,
      },
    };
  } catch (e) {
    return {
      props: {
        error: true,
        cause: (e as Error).message,
      },
    };
  }
};

function isEntryValid(entry: TreeEntry, repo: Repository): boolean {
  // filter out non .md files
  if (entry.type === "blob" && entry.path.split(".").at(-1) !== "md") {
    return false;
  }

  // filter out files outside of baseDirectory
  if (repo.baseDirectory !== undefined) {
    // if not found indexOf returns -1,
    // else it returns the index of the first letter
    if (entry.path.indexOf(repo.baseDirectory) !== 0) {
      return false;
    }
  }

  // filter out ignored files from ignoreFileNames
  if (
    entry.type === "blob" &&
    repo.ignoreFileNames &&
    repo.ignoreFileNames.length > 0
  ) {
    const filename = entry.path.split("/").at(-1);
    if (filename === undefined) {
      return false;
    }
    if (
      repo.ignoreFileNames
        .map((file) => file.toLowerCase())
        .includes(filename.toLowerCase())
    ) {
      return false;
    }
  }
  return true;
}

async function getValidRepoTree(repo: Repository) {
  if (repo.provider === "github.com" || repo.provider === undefined) {
    const apiUrl = `https://api.github.com/repos/${repo.username}/${
      repo.repo
    }/git/trees/${repo.branch ?? "main"}?recursive=1`;
    try {
      const res = await fetch(apiUrl, {
        headers: process.env.GITHUB_TOKEN
          ? {
              Authorization: `Token ${process.env.GITHUB_TOKEN}`,
            }
          : {},
      });

      if (!res.ok) {
        throw new Error("NETWORKING");
      }

      //TODO handle res.json().truncated

      // all of the files in the repo
      const decodedTree: TreeEntry[] = (await res.json()).tree;
      return decodedTree.filter((entry) => isEntryValid(entry, repo));
      //.filter((entry: TreeEntry) => isEntryValid(entry, repo!)).find(entry => )
    } catch (e) {
      throw new Error((e as Error).message);
    }
  } else {
    throw new Error("NOT SUPPORTED");
  }
}

async function getData(
  rootTree: TreeEntry[],
  repo: Repository,
  path: string[] | undefined
) {
  let isDir = true;
  let data: TreeEntry | undefined;

  // if there is a query past the repo name, then
  if (path !== undefined) {
    // find the info about the file/dir
    data = rootTree.find(
      (entry) =>
        entry.path === `${repo!.baseDirectory ?? ""}${path.join("/")}` ||
        entry.path === `${repo!.baseDirectory ?? ""}${path.join("/")}.md`
    );

    // if the queried file/dir cannot be found return early
    if (data === undefined) {
      throw new Error("FILE NOT FOUND");
    }

    isDir = data.type === "tree";
  }

  if (!isDir) {
    // return the file content
    const fileData: FileData = {
      isDir: false,
      content: await getFileContent(data!.url),
      path: [repo.alias ?? repo.repo, ...(path as string[])], // here path is a string[] because the curren target passed the !isDir which means that it is a blob, and a blob cannot be at the root dir, which means there is a path
      //! not sure about the reasoning above.
    };
    return fileData;
  }
  // in this case we are dealing with the root of a repo or another nested directory

  let dirData = rootTree
    .filter((entry) => {
      // filter out files that are not in the queried directory
      if (entry.path.indexOf(path ? path.join("/") : "") !== 0) return false;
      return true;
    })
    .map((entry) => {
      //const {path, type, url} = entry;
      const parsedFilename = entry.path.substring(
        (path ? path.join("/") : "").length
      );
      return {
        filename: parsedFilename.startsWith("/")
          ? parsedFilename.substring(1)
          : parsedFilename, //remove leading /
        isDir: entry.type === "tree",
        url: entry.url,
      };
    })
    .filter((entry) => {
      if (entry.filename === "") return false;

      // filter out files nested inside directories in the queried directories
      if (entry.filename.split("/").length > 1) return false;

      return true;
    });

  const content = (
    await Promise.allSettled(
      dirData.map(async (entry) => {
        if (entry.isDir) {
          const dirData: BaseDirData = {
            isDir: true,
            filename: entry.filename,
          };
          return dirData;
        }
        const fileContent = await getFileContent(entry.url);
        const fileData: BaseFileData = {
          isDir: false,
          filename: entry.filename,
          frontmatter: fileContent.frontmatter,
        };
        return fileData;
      })
    )
  )
    .filter((res) => {
      return res.status === "fulfilled";
    })
    .map((v) => (v as PromiseFulfilledResult<DataEntry>).value);

  const dir: DirData = {
    isDir: true,
    path:
      path === undefined
        ? [repo.alias ?? repo.repo]
        : [repo.alias ?? repo.repo, ...path],
    files: content,
  };
  return dir;
}

// should only be called on blob urls
// fetches and returns decoded blob found at url
async function getFileContent(url: string): Promise<MarkdownFile> {
  const res = await fetch(url, {
    headers: process.env.GITHUB_TOKEN
      ? {
          Authorization: `Token ${process.env.GITHUB_TOKEN}`,
        }
      : {},
  });
  const encodedFile = await res.json();
  const decodedFile = Buffer.from(
    encodedFile.content,
    encodedFile.encoding
  ).toString();
  const parsed = frontMatter<FrontmatterOptions>(decodedFile);
  return {
    frontmatter: parsed.attributes,
    body: parsed.body,
  };
}
