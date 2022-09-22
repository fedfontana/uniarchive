import { Repository } from "$src/types";

const repos: Repository[] = [
    {
        provider: "github.com",
        username: "fedfontana",
        repo: "rotto",
        alias: "rotto",
        courseName: "Prova rotta",
        branch: "main",
        ignoreFileNames: ["README.md"],
        baseDirectory: ""
    },
    {
        provider: "github.com",
        username: "fedfontana",
        repo: "prova_md",
        alias: "prova_md",
        courseName: "Virtualization and Cloud Computing",
        branch: "master",
        ignoreFileNames: ["README.md"],
        baseDirectory: ""
    }
]
export default repos; 