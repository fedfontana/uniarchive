import { GetServerSideProps, NextPage } from "next";

interface Props {}

const PathPage: NextPage = (props: any) => {
  return <div>{JSON.stringify(props)}</div>;
};

export default PathPage;

interface Repository {
  provider?: "github.com" | "gitlab.com";
  username: string;
  repo: string;
  alias?: string;
  courseName?: string;
  branch?: string;
  ignoreFileNames?: string[];
  baseDirectory?: string;
}

interface TreeEntry {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size: number;
  url: string;
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
        ...data,
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
    console.log(`Removing entry: ${entry} because of file extension`)
    return false;
  }

  // filter out files outside of baseDirectory
  if (repo.baseDirectory !== undefined) {
    // if not found indexOf returns -1,
    // else it returns the index of the first letter
    if (entry.path.indexOf(repo.baseDirectory) !== 0)  {
      console.log(`Removing entry: ${entry} because of base dir`)
      return false;
    }
  }

  // filter out ignored files from ignoreFileNames
  if (entry.type === "blob" && repo.ignoreFileNames && repo.ignoreFileNames.length > 0) {
    const filename = entry.path.split("/").at(-1);
    if (filename === undefined) {
      console.log(`Removing entry: ${entry} because of undefined file name`)
      return false;
    }
    if (
      repo.ignoreFileNames
      .map((file) => file.toLowerCase())
      .includes(filename.toLowerCase())
      ) {

        console.log(`Removing entry: ${entry} because of ignored file name`)
        return false;
      }
  }
  return true;
}

// if slug !== null | undefined, it should be used on nodes with node.type==="tree"
async function getValidRepoTree(
  repo: Repository,
  slug: string = `${repo.branch ?? "main"}?recursive=1`
) {
  if (repo.provider === "github.com" || repo.provider === undefined) {
    const apiUrl = `https://api.github.com/repos/${repo.username}/${repo.repo}/git/trees/${slug}`;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error("NETWORKING");
      }

      //TODO handle res.json().truncated

      // all of the files in the repo
      const decodedTree: TreeEntry[] = (await res.json()).tree;
      console.log(
        "Dentro getValidRepo tree con tree: ",
        decodedTree,
        " ::: e filtrato === ",
        decodedTree.filter((entry) => isEntryValid(entry, repo))
      );
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
      (entry) => entry.path === `${repo!.baseDirectory ?? ""}${path.join("/")}`
    );

    // if the queried file/dir cannot be found return early
    if (data === undefined) {
      console.log(`Failed searching for file with path ${repo!.baseDirectory ?? ""}${path.join("/")}`)
      throw new Error("FILE NOT FOUND");
    }

    isDir = data.type === "tree";
  }

  if (!isDir) {
    // return the file content
    try {
      return {
        isDir: false,
        content: getFileContent(data!.url),
        path: [repo.alias, ...(path as string[])], // here path is a string[] because the curren target passed the !isDir which means that it is a blob, and a blob cannot be at the root dir, which means there is a path
        //! not sure about the reasoning above.
      };
    } catch (e) {
      throw new Error((e as Error).message);
    }
  }
  // in this case we are dealing with the root of a repo or another nested directory

  let dirData = rootTree;
  if (data !== undefined) {
    // then path !== undefined (otherwise we would have exited early from this function), so we are looking for stuff in a nested dir
    dirData = await getValidRepoTree(repo, data.sha);
  }
  console.log("Dirdata", dirData);

  const content = (
    await Promise.allSettled(
      dirData.map(async (entry) => {
        if (entry.type === "tree") {
          return {
            isDir: true,
            filename: entry.path,
          };
        }
        return {
          isDir: false,
          content: await getFileContent(entry.url),
        };
      })
    )
  ).filter((res) => {
    console.log(res.status);
    return res.status === "fulfilled";
  }).map(v => (v as PromiseFulfilledResult<any>).value);//TODO remove any and create better types 
  console.log("returning a root dir somehow", content);

  return {
    isDir: true,
    path:
      path === undefined
        ? [repo.alias ?? repo.repo]
        : [repo.alias ?? repo.repo, ...path],
    content,
  };
}

// should only be called on blob urls
// fetches and returns decoded blob found at url
async function getFileContent(url: string) {
  console.log(`Getting data for url: ${url}`);
  const res = await fetch(url);
  const decoded = await res.json();
  return Buffer.from(decoded.content, decoded.encoding).toString();
}
