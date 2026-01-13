import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const language = match ? match[1] : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline || !match) {
    return (
      <code className={`${className} bg-zinc-800/50 text-indigo-200/90 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-indigo-500/10 align-middle`} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-zinc-800/60 bg-[#0d0d0f] overflow-hidden shadow-2xl group ring-1 ring-white/5">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/40 border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
            </div>
            {language && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono ml-2 px-2 py-0.5 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span className="opacity-90 tracking-wide uppercase text-[10px]">{language}</span>
                </div>
            )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-200 transition-colors bg-white/0 hover:bg-white/5 px-2 py-1 rounded-md"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="relative overflow-x-auto">
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{ 
            margin: 0, 
            padding: '1.5rem', 
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
          }}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#52525b', textAlign: 'right' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeBlock,
        p: ({ children }) => <p className="mb-5 last:mb-0 leading-7 text-zinc-300/90 tracking-normal">{children}</p>,
        ul: ({ children }) => <ul className="mb-6 space-y-2 list-disc list-outside ml-5 text-zinc-300/90 marker:text-indigo-500/70">{children}</ul>,
        ol: ({ children }) => <ol className="mb-6 space-y-2 list-decimal list-outside ml-5 text-zinc-300/90 marker:text-indigo-500/70 marker:font-medium">{children}</ol>,
        li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-6 text-white pb-3 border-b border-zinc-800/60 mt-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mb-4 text-indigo-50 mt-10 flex items-center gap-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-medium mb-3 text-indigo-100/90 mt-8">{children}</h3>,
        h4: ({ children }) => <h4 className="text-base font-medium mb-2 text-white mt-6">{children}</h4>,
        blockquote: ({ children }) => (
          <blockquote className="relative pl-5 py-3 my-6 border-l-2 border-indigo-500 bg-indigo-500/5 rounded-r-lg text-indigo-200/80 italic leading-relaxed">
             {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 transition-all duration-200 inline-flex items-baseline gap-0.5"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-8 rounded-xl border border-zinc-800/60 shadow-lg">
            <table className="min-w-full divide-y divide-zinc-800 bg-zinc-900/30 text-left">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-zinc-900/80 text-zinc-200">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-zinc-800/50 bg-transparent">{children}</tbody>,
        tr: ({ children }) => <tr className="hover:bg-zinc-800/30 transition-colors">{children}</tr>,
        th: ({ children }) => (
          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-r border-zinc-800/50 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-5 py-3.5 text-sm text-zinc-400 border-r border-zinc-800/50 last:border-r-0 whitespace-nowrap md:whitespace-normal">
            {children}
          </td>
        ),
        hr: () => <hr className="my-8 border-zinc-800/60" />,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        img: ({ src, alt }) => (
            <img 
                src={src} 
                alt={alt} 
                className="rounded-lg border border-zinc-800 shadow-xl my-6 max-w-full h-auto mx-auto" 
            />
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;