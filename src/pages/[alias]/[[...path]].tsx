import { DataEntry, DirData, FileData, Repository } from "$src/types";

import { promises as fs } from "fs";

import { useEffect, useState } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

import Markdown from "$components/Markdown";
import Breadcrumbs from "$components/Breadcrumbs";
import DirectoryEntry from "$components/DirectoryEntry";
import FileEntry from "$components/FileEntry";
import FrontmatterSection from "$components/FrontmatterSection";

import useFocus from "$lib/useFocus";
import { getData, getValidRepoTree } from "$lib/apiUtils";

interface SuccessProps {
  error: false;
  data: DirData | FileData;
  repo: Repository;
}
interface FailureProps {
  error: true;
  cause: string; //TODO more fine grained type
}

type Props = SuccessProps | FailureProps;

const PathPage: InferGetServerSidePropsType<typeof getServerSideProps> = (
  props: Props
) => {
  const router = useRouter();
  const [inputRef, setInputFocus] = useFocus();

  // use ?q= or ?query= (with prio to ?query=). If they are an array, use the first value. If none of them are used, use "" as the default query
  const [query, setQuery] = useState(
    router.query.query !== undefined
      ? router.query.query instanceof Array
        ? router.query.query[0]
        : router.query.query
      : router.query.q !== undefined
      ? router.query.q instanceof Array
        ? router.query.q[0]
        : router.query.q
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

  //TODO add sort options next to the search box
  //TODO - directories first (on by default)
  //TODO - last updated
  //TODO - held on date

  //TODO add debounce to searches

  const { data, repo } = props;

  if (data.isDir) {
    const files = data.files.filter((entry) =>
      filterQueryResults(entry, query!)
    );

    return (
      <div>
        <CourseHeading repo={repo} path={props.data.path} />
        <div className="my-6">
          <Breadcrumbs path={data.path} />
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-24 mb-6">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Search notes..."
            className="bg-neutral-200 px-6 py-2 rounded-lg flex-grow min-w-[10rem] w-[70%]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
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
      <CourseHeading repo={repo} path={props.data.path} />
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

//TODO add help button that shows keyboard shortcuts and search filters onClick (both [[...path]] and index)

//TODO home page with list of tracked repositories
//TODO add icons to buttons
//TODO functioning dark them switch
//TODO mobile

//TODO add gitlab support

//TODO use getStaticPaths and getStaticProps?

//TODO validate config file with pre-build script

//TODO add tooltips to sort buttons
//TODO add keyboard shortcut hint in input elem

//TODO link in directory view header does not use baseDir (may lead to bugs if baseDir is set)

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
      <span className="flex flex-row items-center gap-3">
        <p className="text-xl font-semibold text-neutral-600">
          see this {path.at(-1)?.endsWith(".md") ? "file" : "directory"} on
        </p>
        <div
          className={`h-8 w-8 ${
            repo.provider === "gitlab.com" ? "bg-orange-500" : "bg-black"
          }`}
        ></div>
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
    </div>
  );
}

//TODO book favicon
//TODO handle this page's errors
//TODO stretch: add route to download all notes as zip of md/pdf files
//TODO fix images not working  

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const alias = query.alias as string;
  const path = query.path as string[] | undefined;

  // if path === undefined, then full repo request
  // if path instanceof Array, then there is a path
  const repos = JSON.parse(
    await fs.readFile(process.cwd() + "/config.json", "utf8")
  ).repos as Repository[];

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
        repo,
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
