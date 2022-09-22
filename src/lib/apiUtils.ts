// should only be called on blob urls

import { BaseDirData, BaseFileData, DataEntry, DirData, FileData, FrontmatterOptions, MarkdownFile, Repository, TreeEntry } from "$src/types";
import frontMatter from "front-matter";

// fetches and returns decoded blob found at url
export async function getFileContent(url: string): Promise<MarkdownFile> {
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

export async function getData(
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

export async function getValidRepoTree(repo: Repository) {
    if (repo.provider === "github.com" || repo.provider === undefined) {
        const apiUrl = `https://api.github.com/repos/${repo.username}/${repo.repo
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
            repo.ignoreFileNames
                .map((file) => file.toLowerCase())
                .includes(filename.toLowerCase())
        ) {
            return false;
        }
    }
    return true;
}