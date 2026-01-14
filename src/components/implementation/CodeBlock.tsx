import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: 'javascript' | 'json' | 'csv' | 'markdown' | 'text';
  title?: string;
  showLineNumbers?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  downloadFilename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  title,
  showLineNumbers = false,
  onCopy,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-900">
      {(title || onCopy || onDownload) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            {title && (
              <span className="text-sm font-medium text-gray-300">{title}</span>
            )}
            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
              {language}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-3 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                Download
              </button>
            )}
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm text-gray-100 font-mono">
          {showLineNumbers ? (
            <table className="border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-gray-500 text-right select-none">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};
