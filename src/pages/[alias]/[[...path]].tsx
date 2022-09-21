import { DirData, FileData, Repository, TreeEntry, BaseDirData, BaseFileData, DataEntry } from "$src/types";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";

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
  return <div>{JSON.stringify(props)}</div>;
};

export default PathPage;

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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
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
    console.log(
      `Removing entry with path: ${entry.path} because of file extension`
    );
    return false;
  }

  // filter out files outside of baseDirectory
  if (repo.baseDirectory !== undefined) {
    // if not found indexOf returns -1,
    // else it returns the index of the first letter
    if (entry.path.indexOf(repo.baseDirectory) !== 0) {
      console.log(
        `Removing entry with path: ${entry.path} because of base dir`
      );
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
      console.log(
        `Removing entry with path: ${entry.path} because of undefined file name`
      );
      return false;
    }
    if (
      repo.ignoreFileNames
        .map((file) => file.toLowerCase())
        .includes(filename.toLowerCase())
    ) {
      console.log(
        `Removing entry with path: ${entry.path} because of ignored file name`
      );
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
    console.log("API_URL: ", apiUrl);
    try {
      const res = await fetch(apiUrl);
      // , {
      //   headers: process.env.GITHUB_CLIENT_SECRET ? {
      //     Authorization: `Bearer ${process.env.GITHUB_CLIENT_SECRET}`
      //   } : {}
      // });
      if (!res.ok) {
        console.log("received status: ", res.status);
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
      console.log(
        `Failed searching for file with path ${
          repo!.baseDirectory ?? ""
        }${path.join("/")}`
      );
      throw new Error("FILE NOT FOUND");
    }

    isDir = data.type === "tree";
  }

  if (!isDir) {
    // return the file content
    try {
      const fileData: FileData = {
        isDir: false,
        content: await getFileContent(data!.url),
        path: [repo.alias ?? repo.repo, ...(path as string[])], // here path is a string[] because the curren target passed the !isDir which means that it is a blob, and a blob cannot be at the root dir, which means there is a path
        //! not sure about the reasoning above.
      };
      return fileData;
    } catch (e) {
      throw new Error((e as Error).message);
    }
  }
  // in this case we are dealing with the root of a repo or another nested directory

  let dirData = rootTree
    .filter((entry) => {
      // filter out files that are not in the queried directory
      if (entry.path.indexOf(path ? path.join("/") : "") !== 0) return false;
      console.log(entry.path, path ? path.join("/") : "");
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
  console.log("BaseDirData:::", dirData);

  //TODO return yml parse prelude of the files instead of the content

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
        const fileData: BaseFileData = {
          isDir: false,
          filename: entry.filename,
          content: await getFileContent(entry.url),
        };
        return fileData;
      })
    )
  )
    .filter((res) => {
      return res.status === "fulfilled";
    })
    .map((v) => (v as PromiseFulfilledResult<DataEntry>).value); //TODO remove any and create better types
  console.log("returning a dir data ::: ", content);

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
async function getFileContent(url: string) {
  const res = await fetch(url);
  // , {
  //   headers: process.env.GITHUB_CLIENT_SECRET ? {
  //     Authorization: `Bearer ${process.env.GITHUB_CLIENT_SECRET}`
  //   } : {}
  // });
  const decoded = await res.json();
  return Buffer.from(decoded.content, decoded.encoding).toString();
}
