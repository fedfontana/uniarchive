import { Config } from "$src/types";

const repos: Config = {
    revalidate: 900, // minimum 15 minutes between each rebuild
    repos: [
        {
            provider: "github.com",
            username: "fedfontana",
            repo: "0h_h1_solver",
            alias: "0h-h1",
            courseName: "Oh-h1 solver",
            branch: "master",
            ignoreFileNames: [],
            baseDirectory: "",
        },
        {
            provider: "github.com",
            username: "fedfontana",
            repo: "prova_md",
            alias: "prova_md",
            courseName: "Virtualization and Cloud Computing",
            branch: "master",
            ignoreFileNames: ["README.md"],
            baseDirectory: "",
        },
    ],
};
export default repos; 