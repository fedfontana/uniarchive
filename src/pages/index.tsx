import type { InferGetStaticPropsType, NextPage } from "next";
import { Repository } from "$src/types";
import { useState } from "react";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  repos,
}) => {
  const [query, setQuery] = useState("");

  if (repos.length === 0) {
    return (
      <div>
        i think you forgot something, its not important -- foto lista repo MEME
      </div>
    );
  }
  let filteredRepos = repos.filter((repo) => filterRepos(repo, query));

  return (
    <div className="flex flex-col gap-4 justify-center mt-20 md:mt-32">
      <input
        type="text"
        placeholder="Filter repositories..."
        className="px-4 py-2 rounded-lg bg-gray-300 max-w-[45rem]"
        value={query}
        onChange={(e) => {setQuery(e.target.value)}}
      />
      {/* REPO DISPLAY */}
      <div className="flex flex-col gap-4">
        {filteredRepos.map((repo, idx) => {
          return (
            <div
              key={`repo-${idx}`}
              className="flex flex-row items-center justify-between px-6 py-4 bg-gray-300 rounded-lg"
            >
              {/* LEFT SECTION */}
              <a href={`/${repo.alias ?? repo.repo}`} className="text-blue-500 hover:underline">
                <h3 className="text-2xl">{repo.courseName}</h3>
                </a>

              {/* RIGHT SECTION */}
              <span className="flex flex-row gap-2 items-center">
                <span className="flex flex-row items-center gap-2">
                  <div
                    className={`h-8 w-8 ${
                      repo.provider === "gitlab.com"
                        ? "bg-orange-500"
                        : "bg-black"
                    }`}
                  />
                  <a
                    className="text-blue-500 hover:underline"
                    href={`https://${repo.provider ?? "github.com"}/${
                      repo.username
                    }/${repo.repo}`}
                  >
                    {repo.username}/{repo.repo}
                  </a>
                </span>
                <span className="flex flex-row items-center gap-2">on 
                  <div
                  className="h-8 w-8 bg-violet-500"/>
                  <p className="text-violet-500 font-semibold">
                   {repo.branch ?? "main"}
                  </p>
                   </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;

function filterRepos(repo: Repository, query: string) {
  const q = query.toLowerCase().trim();
  if (q.startsWith("repo:")) {
    return repo.repo.toLowerCase().trim().includes(q.slice(5));
  } else if (q.startsWith("user:")) {
    return repo.username.toLowerCase().trim().includes(q.slice(6));
  } else if (q.startsWith("course:")) {
    return repo.courseName.toLowerCase().trim().includes(q.slice(7));
  } else if (q.startsWith("provider:")) {
    return (repo.provider ?? "github.com")
      .toLowerCase()
      .trim()
      .includes(q.slice(9));
  } else if (q.startsWith("alias:")) {
    if (repo.alias === undefined) return false;
    return repo.alias!.toLowerCase().trim().includes(q.slice(6));
  } else if (q.startsWith("file:")) {
  } else {
    if (`${repo.username}/${repo.repo}`.includes(q)) return true;
    if (repo.repo.toLowerCase().trim().includes(q)) return true;
    if (repo.username.toLowerCase().trim().includes(q)) return true;
    if (repo.courseName.toLowerCase().trim().includes(q)) return true;
    if ((repo.provider ?? "github.com").toLowerCase().trim().includes(q))
      return true;
    if (repo.alias === undefined) return false;
    return repo.alias!.toLowerCase().trim().includes(q);
  }
}

import repos from '$src/config';
export async function getStaticProps() {
  return {
    props: {
      repos: repos,
    },
  };
}
