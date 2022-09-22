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

interface SuccessProps {
  error: false;
  data: DirData | FileData;
}
interface FailureProps {
  error: true;
  cause: string; //TODO more fine grained type
}

type Props = SuccessProps | FailureProps;

const PathPage: InferGetServerSidePropsType<typeof getServerSideProps> = (
  props: Props
) => {
  if (props.error) {
    return <div>an error occurred. Cause: {props.cause}</div>;
  }

  const { data } = props;

  if (data.isDir) {
    return (
      <div>
        <h2>Files:</h2>
        <pre>
          <code>{JSON.stringify(data.files, undefined, 2)}</code>
        </pre>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-red-300 flex flex-row gap-2">
        Navigation:
        <ul className="flex flex-row gap-2">
          {data.path.map((segment, idx) => {
            const urlSlug = data.path.slice(0, idx + 1).join("/");
            if (idx < data.path.length - 1) {
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
      {(data.content.frontmatter.lastUpdated !== undefined ||
        data.content.frontmatter.lecture?.date !== undefined ||
        data.content.frontmatter.lecture?.title !== undefined ||
        data.content.frontmatter.lecture?.professor !== undefined ||
        (data.content.frontmatter.lecture?.topics !== undefined &&
          data.content.frontmatter.lecture?.topics.length > 0)) && (
        <FrontmatterSection frontmatter={data.content.frontmatter} />
      )}

      <article
        className="pb-10 md:pb-20 mt-20 md:mt-0 max-w-none
          w-10/12 md:w-5/12 mx-auto
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

function FrontmatterSection({
  frontmatter,
}: {
  frontmatter: FrontmatterOptions;
}) {
  return (
    <span className="flex flex-row items-baseline justify-between w-8/12 mx-auto bg-neutral-300 py-4">
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
