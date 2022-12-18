import {
  DataEntry,
  DirData,
  FileData,
  GithubTreeEntry,
  GitlabTreeEntry,
  Repository,
  TreeEntry,
} from "$src/types";

import { useEffect, useState } from "react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";

import Markdown from "$components/Markdown";
import Breadcrumbs from "$components/Breadcrumbs";
import DirectoryEntry from "$components/DirectoryEntry";
import FileEntry from "$components/FileEntry";
import FrontmatterSection from "$components/FrontmatterSection";

import useFocus from "$lib/useFocus";
import { getData } from "$lib/apiUtils";

interface Props {
  data: DirData | FileData;
  repo: Repository;
}

const PathPage: InferGetStaticPropsType<typeof getStaticProps> = (
  props: Props
) => {
  const router = useRouter();
  const [inputRef, setInputFocus] = useFocus();

  const rq = router.query;
  // use ?q= or ?query= (with prio to ?query=). If they are an array, use the first value. If none of them are used, use "" as the default query
  const [query, setQuery] = useState(
    (rq.query !== undefined
      ? rq.query instanceof Array
        ? rq.query[0]
        : rq.query
      : rq.q !== undefined
      ? rq.q instanceof Array
        ? rq.q.length > 0
          ? rq.q[0]
          : ""
        : rq.q
      : "") as string
  );

  useEffect(() => {
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        (setInputFocus as any)();
      }
    });
  }, [inputRef, setInputFocus]);

  const { data, repo } = props;

  if (data.isDir) {
    const files = data.files.filter((entry) =>
      filterQueryResults(entry, query)
    );

    return (
      <div className="pb-24">
        <CourseHeading repo={repo} path={props.data.path} />
        <div className="my-6">
          <Breadcrumbs path={props.data.path} />
        </div>
        <input
          ref={inputRef}
          autoFocus
          type="text"
          placeholder="Filter files in this directory..."
          className="bg-neutral-200 dark:bg-neutral-700 px-6 py-2 rounded-lg flex-grow min-w-[10rem] w-full md:w-[70%] transition-colors duration-500 md:gap-24 mb-6"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />

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
    <div className="pb-24">
      <CourseHeading repo={repo} path={props.data.path} />
      <div className="mb-4">
        <Breadcrumbs path={props.data.path} />
      </div>
      {frontMatterNotEmpty && (
        <FrontmatterSection frontmatter={data.content.frontmatter} />
      )}

      <div className="md:h-8"/>

      <article
        className="pb-10 md:pb-20 mt-20 md:mt-0 max-w-none
          w-10/12 mx-auto
          font-sourcecodepro
          transition-colors duration-500
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
        <Markdown
          path={props.data.path}
          repo={repo}
          content={(props.data as FileData).content.body}
        />
      </article>
    </div>
  );
};

export default PathPage;

function filterQueryResults(entry: DataEntry, query: string) {
  const q = query.toLowerCase().trim();
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
    if (frontmatter.lecture?.topics && frontmatter.lecture?.topics.length > 0) {
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
        frontmatter.lecture.title.toLowerCase().trim().includes(q) !== undefined
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
}

function CourseHeading({ repo, path }: { repo: Repository; path: string[] }) {
  return (
    <div className="flex flex-col gap-4 my-8 items-start">
      <h1 className="text-4xl font-bold">{repo.courseName}</h1>
      <span className="hidden md:flex flex-row items-center gap-1">
        <p className="text-xl font-semibold text-neutral-600 dark:text-neutral-300">
          see this {path.at(-1)?.endsWith(".md") ? "file" : "directory"} on
        </p>
        <ProviderLogo provider={repo.provider} />
        <a
          className="text-xl font-semibold hover:underline text-blue-500"
          href={`https://${repo.provider ?? "github.com"}/${repo.username}/${
            repo.repo
          }${
            path.length > 1
              ? `/tree/${repo.branch ?? "main"}/${path.slice(1).join("/")}`
              : ""
          }`}
        >
          {repo.username}/{repo.repo}
        </a>
      </span>
      <span className="md:hidden text-lg flex flex-row gap-3">
        source code available
        <a
          className="font-semibold hover:underline text-blue-500"
          href={`https://${repo.provider ?? "github.com"}/${repo.username}/${
            repo.repo
          }${
            path.length > 1
              ? `/tree/${repo.branch ?? "main"}/${path.slice(1).join("/")}`
              : ""
          }`}
        >
          here
        </a>
      </span>
    </div>
  );
}

import config from "$src/config";
import ProviderLogo from "$src/components/ProviderLogo";
export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params) throw new Error("wtf");
  const alias = params.alias as string;
  const path = params.path as string[] | undefined;
  const { repos, revalidate } = config;

  let repo = repos.find((repo) => repo.alias === alias || repo.repo === alias);
  if (repo === undefined) {
    throw new Error("Not found");
  }

  let data = await getData(repo, path ?? []);
  return {
    revalidate: revalidate ?? 900,
    props: {
      data,
      repo,
    },
  };
};


export const getStaticPaths: GetStaticPaths = async () => {
  const { repos } = config;

  let paths: { alias: string; path: string[] | undefined }[] = [];
  for (const repo of repos) {
    if (repo.provider === "gitlab.com") {
      //TODO I think that this only works for projects/subprojects
      const apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repo.repo)}/repository/tree?recursive=true&limit=2000&ref=${repo.branch ?? "main"}&path=${repo.baseDirectory ?? ""}`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`NETWORKING at ${apiUrl}`);
      }
      const decoded: GitlabTreeEntry[] = await res.json();
      const tree = decoded.filter(entry => isEntryValid(entry, repo));
      console.log(tree);
      paths = paths.concat(
        tree.map((entry) => {
          let newPath = entry.path;
          if (
            repo.baseDirectory !== undefined &&
            repo.baseDirectory !== "" &&
            entry.path.startsWith(repo.baseDirectory)
          ) {
            newPath = entry.path.slice(repo.baseDirectory.length + 1);
          }
          return {
            alias: repo.alias ?? repo.repo,
            path: newPath === "" ? undefined : newPath.split("/"),
          };
        })
      );
      continue;
    }

    const apiUrl = `https://api.github.com/repos/${repo.username}/${
      repo.repo
    }/git/trees/${repo.branch ?? "main"}?recursive=1`;
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
    const decoded: GithubTreeEntry[] = (await res.json()).tree;

    const tree = decoded.filter((entry) => isEntryValid(entry, repo));
    paths = paths.concat(
      tree.map((entry) => {
        let newPath = entry.path;
        if (
          repo.baseDirectory !== undefined &&
          repo.baseDirectory !== "" &&
          entry.path.startsWith(repo.baseDirectory)
        ) {
          newPath = entry.path.slice(repo.baseDirectory.length + 1);
        }
        return {
          alias: repo.alias ?? repo.repo,
          path: newPath === "" ? undefined : newPath.split("/"),
        };
      })
    );
  }
  return {
    fallback: "blocking",
    paths: paths.map((path) => {
      return { params: path };
    }),
  };
};

export function isEntryValid(entry: TreeEntry, repo: Repository): boolean {
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
      (repo.ignoreFileNames ?? ["README.md"])
        .map((file) => file.toLowerCase())
        .includes(filename.toLowerCase())
    ) {
      return false;
    }
  }
  return true;
}
