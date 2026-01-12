import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-lg !bg-zinc-950 !my-4 border border-zinc-800/60 shadow-lg"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={`${className} bg-zinc-800/80 text-zinc-200 px-1.5 py-0.5 rounded text-sm border border-zinc-700/30 hover:bg-zinc-700/50 transition-colors cursor-default`} {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-zinc-300">{children}</p>,
        ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1 text-zinc-300">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1 text-zinc-300">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-zinc-100 pb-2 border-b border-zinc-800">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-zinc-100 mt-6">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-zinc-200 mt-4">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-indigo-500/80 pl-4 italic text-zinc-400 my-4 bg-zinc-900/30 py-2 pr-2 rounded-r hover:bg-zinc-900/50 transition-colors duration-300">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 transition-all duration-200"
          >
            {children}
          </a>
        ),
        // Enhanced Table Components
        table: ({ children }) => (
          <div className="overflow-x-auto my-6 rounded-lg border border-zinc-800 shadow-sm">
            <table className="min-w-full divide-y divide-zinc-800 bg-zinc-900/20">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-zinc-900/80">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-zinc-800/50">{children}</tbody>,
        tr: ({ children }) => <tr className="hover:bg-zinc-800/40 transition-colors duration-150">{children}</tr>,
        th: ({ children }) => (
          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-r border-zinc-800 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-sm text-zinc-400 border-r border-zinc-800/50 last:border-r-0">
            {children}
          </td>
        ),
        hr: () => <hr className="my-6 border-zinc-800" />
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;