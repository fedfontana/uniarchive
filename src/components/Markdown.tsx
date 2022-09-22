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

interface Props {
  content: string;
  [key: string]: string;
}

export default function Markdown({ content, ...rest }: Props) {
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
              style={theme}
              language={match[1]}
              PreTag="pre"
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
      {...rest}
    />
  );
}
