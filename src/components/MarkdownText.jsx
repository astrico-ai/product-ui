import React from "react";

export function MarkdownText({ text }) {
  if (!text) return null;

  // Process markdown formatting - simpler approach
  const processMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const result = [];
    let listItems = [];
    let listType = null; // 'ul' or 'ol'
    let tableRows = [];
    let inTable = false;
    let blockquoteLines = [];
    let inBlockquote = false;

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Check if this is a table row (starts with | and contains |)
      const isTableRow = trimmedLine.startsWith('|') && trimmedLine.includes('|') && trimmedLine.length > 1;
      const isTableSeparator = isTableRow && /^\|[\s\-:]+\|/.test(trimmedLine);
      
      // Check if this is a blockquote (starts with >)
      const isBlockquote = trimmedLine.startsWith('>');

      // Handle blockquotes
      if (isBlockquote) {
        // Close any open lists, tables, or other blockquotes before starting new blockquote
        if (listItems.length > 0) {
          result.push(renderList(listItems, listType, `list-${lineIndex}`));
          listItems = [];
          listType = null;
        }
        if (inTable && tableRows.length > 0) {
          result.push(renderTable(tableRows, `table-${lineIndex}`));
          tableRows = [];
          inTable = false;
        }
        if (inBlockquote && blockquoteLines.length > 0) {
          result.push(renderBlockquote(blockquoteLines, `blockquote-${lineIndex}`));
          blockquoteLines = [];
        }
        
        // Extract content after >
        const blockquoteContent = trimmedLine.substring(1).trim();
        blockquoteLines.push(blockquoteContent);
        inBlockquote = true;
      }
      // Handle tables
      else if (isTableRow && !isTableSeparator) {
        // Close any open lists, blockquotes before starting table
        if (listItems.length > 0) {
          result.push(renderList(listItems, listType, `list-${lineIndex}`));
          listItems = [];
          listType = null;
        }
        if (inBlockquote && blockquoteLines.length > 0) {
          result.push(renderBlockquote(blockquoteLines, `blockquote-${lineIndex}`));
          blockquoteLines = [];
          inBlockquote = false;
        }
        
        // Parse table row
        const cells = trimmedLine
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0); // Remove empty cells from split
        
        tableRows.push(cells);
        inTable = true;
      } else if (isTableSeparator) {
        // Table separator row - ignore it, but keep table state
        inTable = true;
      } else {
        // Not a table row or blockquote - render any accumulated table or blockquote
        if (inTable && tableRows.length > 0) {
          result.push(renderTable(tableRows, `table-${lineIndex}`));
          tableRows = [];
          inTable = false;
        }
        if (inBlockquote && blockquoteLines.length > 0) {
          result.push(renderBlockquote(blockquoteLines, `blockquote-${lineIndex}`));
          blockquoteLines = [];
          inBlockquote = false;
        }
        
        // Headers
        if (trimmedLine.startsWith('### ')) {
          if (listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
            listType = null;
          }
          result.push(
            <h3 key={`h3-${lineIndex}`} className="font-bold text-lg mt-4 mb-2">
              {processInlineMarkdown(trimmedLine.substring(4))}
            </h3>
          );
        } else if (trimmedLine.startsWith('## ')) {
          if (listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
            listType = null;
          }
          result.push(
            <h2 key={`h2-${lineIndex}`} className="font-bold text-xl mt-4 mb-2">
              {processInlineMarkdown(trimmedLine.substring(3))}
            </h2>
          );
        } else if (trimmedLine.startsWith('# ')) {
          if (listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
            listType = null;
          }
          result.push(
            <h1 key={`h1-${lineIndex}`} className="font-bold text-2xl mt-4 mb-2">
              {processInlineMarkdown(trimmedLine.substring(2))}
            </h1>
          );
        }
        // Document reference or field label (ends with colon, not a header)
        else if (trimmedLine.endsWith(':') && !trimmedLine.startsWith('#') && trimmedLine.length > 1) {
          if (listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
            listType = null;
          }
          // Check if it looks like a document reference (contains parentheses or numbers)
          const isDocumentRef = /\([^)]+\)/.test(trimmedLine) || /^\w+\s+\d+/.test(trimmedLine);
          if (isDocumentRef) {
            result.push(
              <div key={`doc-ref-${lineIndex}`} className="font-semibold text-base mt-3 mb-1 text-gray-800">
                {processInlineMarkdown(trimmedLine)}
              </div>
            );
          } else {
            // Regular field label
            result.push(
              <div key={`field-${lineIndex}`} className="font-medium text-base mt-2 mb-1 text-gray-700">
                {processInlineMarkdown(trimmedLine)}
              </div>
            );
          }
        }
        // Unordered list
        else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          if (listType !== 'ul' && listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
          }
          listType = 'ul';
          listItems.push(processInlineMarkdown(trimmedLine.substring(2)));
        }
        // Numbered list
        else if (/^\d+\.\s/.test(trimmedLine)) {
          if (listType !== 'ol' && listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
          }
          listType = 'ol';
          const match = trimmedLine.match(/^\d+\.\s(.*)/);
          if (match) {
            listItems.push(processInlineMarkdown(match[1]));
          }
        }
        // Regular paragraph
        else if (trimmedLine) {
          if (listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
            listType = null;
          }
          result.push(
            <p key={`p-${lineIndex}`} className="mb-2">
              {processInlineMarkdown(line)}
            </p>
          );
        } else {
          // Empty line
          if (listItems.length > 0) {
            result.push(renderList(listItems, listType, `list-${lineIndex}`));
            listItems = [];
            listType = null;
          }
          if (lineIndex < lines.length - 1) {
            result.push(<br key={`br-${lineIndex}`} />);
          }
        }
      }
    });

    // Render any remaining list items
    if (listItems.length > 0) {
      result.push(renderList(listItems, listType, 'list-final'));
    }

    // Render any remaining table
    if (tableRows.length > 0) {
      result.push(renderTable(tableRows, 'table-final'));
    }

    // Render any remaining blockquote
    if (blockquoteLines.length > 0) {
      result.push(renderBlockquote(blockquoteLines, 'blockquote-final'));
    }

    return result.length > 0 ? result : processInlineMarkdown(text);
  };

  const renderTable = (rows, key) => {
    if (rows.length === 0) return null;

    // First row is header
    const headerRow = rows[0];
    const dataRows = rows.slice(1);

    return (
      <div key={key} className="my-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#3551F3] text-white">
              {headerRow.map((cell, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-sm font-semibold border border-gray-300"
                >
                  {processInlineMarkdown(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-3 text-sm text-gray-900 border border-gray-300"
                  >
                    {processInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderList = (items, type, key) => {
    if (type === 'ol') {
      return (
        <ol key={key} className="list-decimal list-inside ml-4 my-2 space-y-1">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      );
    } else {
      return (
        <ul key={key} className="list-disc list-inside ml-4 my-2 space-y-1">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
  };

  const renderBlockquote = (lines, key) => {
    if (lines.length === 0) return null;
    
    return (
      <blockquote key={key} className="border-l-4 border-[#3551F3] pl-4 py-2 my-3 bg-gray-50 rounded-r-lg">
        {lines.map((line, idx) => (
          <div key={idx} className="text-gray-700 italic mb-1 last:mb-0">
            {processInlineMarkdown(line)}
          </div>
        ))}
      </blockquote>
    );
  };

  // Process inline markdown (bold, italic)
  const processInlineMarkdown = (text) => {
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;
    let key = 0;

    // Match **bold** (greedy, non-overlapping)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const matches = [];

    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        type: 'bold',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1]
      });
    }

    // Sort by position
    matches.sort((a, b) => a.start - b.start);

    // Build parts
    matches.forEach((match) => {
      // Text before match
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start);
        if (beforeText) {
          parts.push({ type: 'text', content: beforeText, key: `text-${key++}` });
        }
      }

      // Bold match
      parts.push({ type: 'bold', content: match.content, key: `bold-${key++}` });
      lastIndex = match.end;
    });

    // Remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex), key: `text-${key++}` });
    }

    if (parts.length === 0) {
      return text;
    }

    return parts.map((part) => {
      if (part.type === 'bold') {
        return <strong key={part.key} className="font-semibold">{part.content}</strong>;
      } else {
        return <React.Fragment key={part.key}>{part.content}</React.Fragment>;
      }
    });
  };

  const processed = processMarkdown(text);

  return (
    <div className="leading-relaxed">
      {processed}
    </div>
  );
}
