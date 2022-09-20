import assert from "assert";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";

interface Repository {
  provider?: "github.com" | "gitlab.com";
  username: string;
  repo: string;
  as?: string;
  courseName?: string;
  branch?: string;
  ignoreFileNames?: string[];
  baseDirectory?: string;
}

const PathPage: NextPage = () => {
  return <div>ciao page</div>;
};

export default PathPage;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const repos: Repository[] = [
    {
      provider: "github.com", // optional provider. Defaults to github. Supports github and gitlab.
      username: "fedfontana",
      repo: "vcc", // this will look at github.com/fedfontana/vcc. Make sure that this repo is public!
      as: "vcc", // optional new name for the repository. Defaults to the value of "repo". Useful when two repos from different users have the same name. This gets used in the url.
      courseName: "Virtualization and Cloud Computing", // optional long name of the course
      branch: "master", // optional branch name. Defaults to main
      ignoreFileNames: ["README.md"], // optional list of ignored file names (case insensitive). Defaults to ["README.md"]. If you want to include readmes, just pass [] as option
      baseDirectory: "/",
    },
  ];

  const repo = repos.find((repo) => repo.as === params!.course);
  assert(repo !== undefined);

  // find file

  // return either directory ("type" === "tree") or file

  return {
    props: {},
    revalidate: 60,
  };
};

interface TreeEntry {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size: number;
  url: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const repos: Repository[] = [
    {
      provider: "github.com", // optional provider. Defaults to github. Supports github and gitlab.
      username: "fedfontana",
      repo: "vcc", // this will look at github.com/fedfontana/vcc. Make sure that this repo is public!
      as: "vcc", // optional new name for the repository. Defaults to the value of "repo". Useful when two repos from different users have the same name. This gets used in the url.
      courseName: "Virtualization and Cloud Computing", // optional long name of the course
      branch: "master", // optional branch name. Defaults to main
      ignoreFileNames: ["README.md"], // optional list of ignored file names (case insensitive). Defaults to ["README.md"]. If you want to include readmes, just pass [] as option
      baseDirectory: "/",
    },
  ];

  const promises = await Promise.allSettled(
    repos.map(async (repo) => {
      if (repo.provider === "github.com") {
        const apiUrl = `api.github.com/${repo.username}/${
          repo.repo
        }/git/trees/${repo.branch ?? "main"}?recursive=1`;
        const res = await fetch(apiUrl);

        if (!res.ok) {
          throw Error(`Could not get file data from ${apiUrl}`);
        }

        //TODO handle res.json().truncated

        // all of the files in the repo
        const tree: TreeEntry[] = (await res.json()).tree;

        return tree
          .filter((entry) => {
            // filter out non .md files
            if (entry.path.split(".").at(-1) !== "md") return false;

            // filter out files outside of baseDirectory
            if (repo.baseDirectory !== undefined) {
				// if not found indexOf returns -1,
				// else it returns the index of the first letter
              if (entry.path.indexOf(repo.baseDirectory) !== 0) return false;
            }

            // filter out ignored files from ignoreFileNames
            if (repo.ignoreFileNames && repo.ignoreFileNames.length > 0) {
              const filename = entry.path.split("/").at(-1);
              if (filename === undefined) return false;

              if (
                repo.ignoreFileNames
                  .map((file) => file.toLowerCase())
                  .includes(filename.toLowerCase())
              )
                return false;
            }
            return true;
          })
          .map((entry) => {
            if (repo.baseDirectory === undefined) {
              return entry.path;
            }
            // remove the ignored part of the path
            return entry.path.substring(repo.baseDirectory.length);
          });
      } else if (repo.provider === "gitlab.com") {
        //TODO handle github repositories
        throw new Error("gitlab repositories are not supported yet");
      }
    })
  );

  const paths = promises
    .filter((res) => res.status === "fulfilled")
    .map((res) => (res as PromiseFulfilledResult<string[]>).value)
    .flatMap((v) => v);

  return { paths, fallback: "blocking" };
};
