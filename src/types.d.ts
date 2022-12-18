export interface Repository {
    provider?: "github.com" | "gitlab.com";
    username: string;
    repo: string;
    alias?: string;
    courseName: string;
    branch?: string;
    ignoreFileNames?: string[];
    baseDirectory?: string;
}

export interface TreeEntry {
    path: string;
    mode: string;
    type: "blob" | "tree";
}

export interface GithubTreeEntry extends TreeEntry {
    sha: string;
    size: number;
    url: string;
}

export interface GitlabTreeEntry extends TreeEntry {
    id: string,
    name: string,
}


export interface BaseDirData {
    filename: string,
    isDir: true,
}
export interface BaseFileData {
    filename: string,
    isDir: false,
    frontmatter: FrontmatterOptions,
}

export type DataEntry = BaseDirData | BaseFileData;

export interface DirData {
    isDir: true,
    files: DataEntry[],
    path: string[],
}

export interface FileData {
    isDir: false,
    path: string[],
    content: MarkdownFile,
}

export interface FrontmatterOptions {
    lastUpdated?: string,
    lecture?: {
        date?: string,
        topics?: string[],
        title?: string,
        professor?: string
    }
}


export interface MarkdownFile {
    frontmatter: FrontmatterOptions;
    body: string;
}

export interface Config {
    revalidate?: number;
    repos: Repository[];
}