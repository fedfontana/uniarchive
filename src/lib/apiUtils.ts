import { BaseDirData, BaseFileData, DataEntry, DirData, FileData, FrontmatterOptions, MarkdownFile, Repository } from "$src/types";
import frontMatter from "front-matter";

const DEFAULT_GIT_BRANCH = "main";
const DEFAULT_BASE_DIRECTORY = "";
interface DirEntry {
    name: string,
    path: string,
    url: string,
    type: "dir" | "file",
}
interface FileEntry {
    name: string,
    path: string,
    url: string,
    type: "file",
    content: string,
    encoding: string,
} //! files have download_url !== null. Maybe it is useful for images?

type TreeEntry = DirEntry | FileEntry;

//TODO test this
function sortDirectoryContent(content: DataEntry[]) {
    return content.sort((a, b) => {
        // sort directories first
        if (a.isDir && !b.isDir) return -1;
        if (b.isDir && !a.isDir) return 1;
        // if both are directories, then sort them alphabetically
        if (a.isDir && b.isDir) return Number(a.filename > b.filename);
        // if both are files
        const aLectureDate = (a as BaseFileData).frontmatter.lecture?.date !== undefined ? new Date((a as BaseFileData).frontmatter?.lecture?.date as string) : undefined;
        const bLectureDate = (b as BaseFileData).frontmatter.lecture?.date !== undefined ? new Date((b as BaseFileData).frontmatter?.lecture?.date as string) : undefined;
        // sort them by lecture date descending
        if (aLectureDate && !bLectureDate) return 1;
        if (bLectureDate && !aLectureDate) return -1;
        if (aLectureDate && bLectureDate && aLectureDate !== bLectureDate) return Number(aLectureDate > bLectureDate);
        // if they have the same lecture date, then sort them alphabetically (lectures with no name will be sorted last)
        const aTitle = (a as BaseFileData).frontmatter.lecture?.title;
        const bTitle = (b as BaseFileData).frontmatter.lecture?.title;
        if (aTitle && !bTitle) return 1;
        if (bTitle && !aTitle) return -1;
        if (aTitle && bTitle) return Number(aTitle > bTitle);
        return 0;
    });
}

async function getGitlabData(repo: Repository, path: string[]) {
    throw new Error("NOT SUPPORTED");
    const apiUrl = `https://gitlab.com/????????`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
        throw new Error("NETWORKING");
    }

    const decoded = await res.json();
    if (decoded instanceof Array) { //Directory
        const dirContent = (decoded as DirEntry[]).filter((entry) => isEntryValid(entry, repo));
        let content = (
            await Promise.allSettled(
                dirContent.map(async (entry) => {
                    if (entry.type === "dir") {
                        const dirData: BaseDirData = {
                            isDir: true,
                            filename: entry.name,
                        };
                        return dirData;
                    }
                    const frontmatter = await getFileFrontmatterFromURL(entry.url);
                    const fileData: BaseFileData = {
                        isDir: false,
                        filename: entry.name,
                        frontmatter,
                    };
                    return fileData;
                })
            )
        ).filter((res) => {
            return res.status === "fulfilled";
        })
            .map((v) => (v as PromiseFulfilledResult<DataEntry>).value);

        const sorted = sortDirectoryContent(content);
        const dir: DirData = {
            isDir: true,
            path: [repo.alias ?? repo.repo, ...path],
            files: sorted,
        };
        return dir;
    }
    // File
    const file = (decoded as FileEntry);
    if (!isEntryValid(file, repo)) throw new Error("NOT FOUND");
    const fileRes = await fetch(file.url, {
        headers: process.env.GITHUB_TOKEN
            ? {
                Authorization: `Token ${process.env.GITHUB_TOKEN}`,
            }
            : {},
    });
    if (!fileRes.ok) throw new Error("FILE NETWORKING ERROR");
    const encodedFile: FileEntry = await fileRes.json();
    const decodedFile = Buffer.from(
        encodedFile.content,
        encodedFile.encoding as BufferEncoding
    ).toString();
    const parsed = frontMatter<FrontmatterOptions>(decodedFile);

    return {
        isDir: false,
        name: encodedFile.name,
        path: [repo.alias ?? repo.repo, ...path],
        content: {
            frontmatter: parsed.attributes,
            body: parsed.body,
        },
    };
}

async function getGithubData(repo: Repository, path: string[]) {
    const apiUrl = `https://api.github.com/repos/${repo.username}/${repo.repo
        }/contents/${repo.baseDirectory && `${repo.baseDirectory}/`}${path.join("/")}?ref=${repo.branch ?? DEFAULT_GIT_BRANCH}`;
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
    const decoded = await res.json();
    if (decoded instanceof Array) { //Directory
        const dirContent = (decoded as DirEntry[]).filter((entry) => isEntryValid(entry, repo));
        let content = (
            await Promise.allSettled(
                dirContent.map(async (entry) => {
                    if (entry.type === "dir") {
                        const dirData: BaseDirData = {
                            isDir: true,
                            filename: entry.name,
                        };
                        return dirData;
                    }
                    const frontmatter = await getFileFrontmatterFromURL(entry.url);
                    const fileData: BaseFileData = {
                        isDir: false,
                        filename: entry.name,
                        frontmatter,
                    };
                    return fileData;
                })
            )
        ).filter((res) => {
            return res.status === "fulfilled";
        })
            .map((v) => (v as PromiseFulfilledResult<DataEntry>).value);

        const sorted = sortDirectoryContent(content);
        const dir: DirData = {
            isDir: true,
            path: [repo.alias ?? repo.repo, ...path],
            files: sorted,
        };
        return dir;
    }
    // File
    const file = (decoded as FileEntry);
    if (!isEntryValid(file, repo)) throw new Error("NOT FOUND");
    const fileRes = await fetch(file.url, {
        headers: process.env.GITHUB_TOKEN
            ? {
                Authorization: `Token ${process.env.GITHUB_TOKEN}`,
            }
            : {},
    });
    if (!fileRes.ok) throw new Error("FILE NETWORKING ERROR");
    const encodedFile: FileEntry = await fileRes.json();
    const decodedFile = Buffer.from(
        encodedFile.content,
        encodedFile.encoding as BufferEncoding
    ).toString();
    const parsed = frontMatter<FrontmatterOptions>(decodedFile);

    return {
        isDir: false,
        name: encodedFile.name,
        path: [repo.alias ?? repo.repo, ...path],
        content: {
            frontmatter: parsed.attributes,
            body: parsed.body,
        },
    };
}

export async function getData(repo: Repository, path: string[]) {
    if (repo.provider !== "github.com" && repo.provider !== undefined) {
        return getGitlabData(repo, path);

    }
    return getGithubData(repo, path);
}

async function getFileFrontmatterFromURL(url: string) {
    const fileRes = await fetch(url, {
        headers: process.env.GITHUB_TOKEN
            ? {
                Authorization: `Token ${process.env.GITHUB_TOKEN}`,
            }
            : {},
    });
    if (!fileRes.ok) throw new Error("FILE NETWORKING ERROR");
    const encodedFile: FileEntry = await fileRes.json();
    const decodedFile = Buffer.from(
        encodedFile.content,
        encodedFile.encoding as BufferEncoding
    ).toString();
    const parsed = frontMatter<FrontmatterOptions>(decodedFile);
    return parsed.attributes
}

export function isEntryValid(entry: TreeEntry, repo: Repository): boolean {
    // filter out non .md files
    if (entry.type === "file" && entry.path.split(".").at(-1) !== "md") {
        return false;
    }

    // filter out ignored files from ignoreFileNames
    if (
        entry.type === "file" &&
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