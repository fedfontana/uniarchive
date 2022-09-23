/* eslint-disable react/no-children-prop */
import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import remarkSuperSub from "remark-supersub";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import theme from "$src/gruvboxDark";
import { Repository } from "$src/types";
import Image from "next/image";

interface Props {
  content: string;
  repo: Repository;
  path: string[]
  [key: string]: any;
}

export default function Markdown({ content, repo, path, ...rest }: Props) {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[
        remarkGfm,
        [
          remarkSmartypants,
          {
            dashes: "oldschool",
          },
        ],
        remarkParse,
        remarkMath,
        remarkEmoji,
        remarkSuperSub,
      ]}
      rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              children={String(children).replace(/\n$/, "")}
              style={theme as any}
              language={match[1]}
              PreTag="pre"
              showLineNumbers
              showInlineLineNumbers
              wrapLongLines
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        img({ alt, src }) {
          let newSrc = src!;
          if(!src?.startsWith("https://") && !src?.startsWith("http://"))
            newSrc = `https://raw.githubusercontent.com/${repo.username}/${repo.repo}/${repo.branch ?? "main"}/${path.slice(1, -1).join("/")}/${src!}`
          console.log(newSrc);
          return (
            <span className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newSrc} alt={alt} />
              <span className="">
                Description: {alt}
              </span>
            </span>
          );
        },
      }}
      {...rest}
    />
  );
}
