import type { InferGetStaticPropsType, NextPage } from "next";
import { Repository } from "$src/types";
import { useState } from "react";
import config from "$src/config";
import ProviderLogo from "$src/components/ProviderLogo";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  repos,
}) => {
  const [query, setQuery] = useState("");

  if (repos.length === 0) {
    return (
      <div className="w-full mt-24 flex flex-col gap-8 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/meme.jpg"
          alt="forgot to add repositories in config in meme format"
        />
        <h2 className="text-2xl text-red-600 font-bold uppercase">
          no repositories found in config.ts
        </h2>
      </div>
    );
  }
  let filteredRepos = repos.filter((repo) => filterRepos(repo, query));

  return (
    <div className="flex flex-col gap-4 justify-center mt-20 md:mt-32">
      <input
        type="text"
        placeholder="Filter repositories..."
        className="px-4 py-2 rounded-lg bg-neutral-300 dark:bg-neutral-700 max-w-[45rem] transition-colors duration-500"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
      {/* REPO DISPLAY */}
      <div className="flex flex-col gap-4">
        {filteredRepos.map((repo, idx) => {
          return (
            <div
              key={`repo-${idx}`}
              className="flex flex-row items-center justify-between px-6 py-4 bg-neutral-300 dark:bg-neutral-800 rounded-lg transition-colors duration-500"
            >
              {/* LEFT SECTION */}
              <a
                href={`/${repo.alias ?? repo.repo}`}
                className="text-blue-500 hover:underline"
              >
                <h3 className="text-2xl">{repo.courseName}</h3>
              </a>

              {/* RIGHT SECTION */}
              <span className="flex flex-row gap-2 items-center">
                <span className="flex flex-row items-center gap-2">
                  <ProviderLogo provider={repo.provider} />
                  <a
                    className="text-blue-500 hover:underline font-semibold"
                    href={`https://${repo.provider ?? "github.com"}/${
                      repo.username
                    }/${repo.repo}`}
                  >
                    {repo.username}/{repo.repo}
                  </a>
                </span>
                <span className="flex flex-row items-center gap-2">
                  on
                  <svg
                    className="fill-violet-500"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 3c0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.323.861 2.433 2.05 2.832.168 4.295-2.021 4.764-4.998 5.391-1.709.36-3.642.775-5.052 2.085v-7.492c1.163-.413 2-1.511 2-2.816 0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.305.837 2.403 2 2.816v12.367c-1.163.414-2 1.512-2 2.817 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.295-.824-2.388-1.973-2.808.27-3.922 2.57-4.408 5.437-5.012 3.038-.64 6.774-1.442 6.579-7.377 1.141-.425 1.957-1.514 1.957-2.803zm-16.8 0c0-.993.807-1.8 1.8-1.8s1.8.807 1.8 1.8-.807 1.8-1.8 1.8-1.8-.807-1.8-1.8zm3.6 18c0 .993-.807 1.8-1.8 1.8s-1.8-.807-1.8-1.8.807-1.8 1.8-1.8 1.8.807 1.8 1.8z" />
                  </svg>
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

export async function getStaticProps() {
  return {
    props: {
      repos: config.repos,
    },
  };
}
