import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders user-supplied markdown (GitHub Flavored: tables, task lists,
// strikethrough, autolinks). Raw HTML in the source is intentionally NOT
// rendered — react-markdown drops it by default unless rehype-raw is added,
// which is what keeps this safe against XSS from untrusted descriptions.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20 prose-a:text-rebel-red prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: linkChildren, ...rest }) => (
            <a
              {...rest}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkChildren}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
