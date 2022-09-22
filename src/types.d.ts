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
    frontmatter: FrontmatterOptions,
}

export type DataEntry = BaseDirData | BaseFileData;

//TODO find better names
export interface DirData {
    isDir: true,
    files: DataEntry[],
    path: string[],
}

//TODO unify with BaseFileData
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