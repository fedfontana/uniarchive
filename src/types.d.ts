export interface Repository {
    provider?: "github.com" | "gitlab.com";
    username: string;
    repo: string;
    alias?: string;
    courseName?: string;
    branch?: string;
    ignoreFileNames?: string[];
    baseDirectory?: string;
}

export interface TreeEntry {
    path: string;
    mode: string;
    type: "blob" | "tree";
    sha: string;
    size: number;
    url: string;
}

export interface BaseDirData {
    filename: string,
    isDir: true,
}
export interface BaseFileData {
    filename: string,
    isDir: false,
    content: string,
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
    content: string,
}