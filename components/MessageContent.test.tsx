
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageContent } from './MessageContent';
import { FileDocument } from '../types';

describe('MessageContent', () => {
  const mockFiles: FileDocument[] = [
    { id: '1', name: 'lecture.pdf', type: 'pdf', content: '', uploadDate: 0, status: 'ready' }
  ];

  it('renders plain text correctly', () => {
    render(<MessageContent content="Hello world" files={[]} onExplain={vi.fn()} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders code block with explain button', () => {
    const code = 'console.log("test")';
    const content = 'Here is code:\n```javascript\n' + code + '\n```';
    render(<MessageContent content={content} files={[]} onExplain={vi.fn()} />);

    expect(screen.getByText('Code Snippet')).toBeInTheDocument();
    expect(screen.getByText('Explain')).toBeInTheDocument();
    // The code might be rendered inside a code block
    const codeElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'code' && content.includes(code);
    });
    expect(codeElement).toBeInTheDocument();
  });

  it('calls onExplain when explain button is clicked', () => {
    const onExplain = vi.fn();
    const code = 'const x = 1;';
    const content = '```\n' + code + '\n```';
    render(<MessageContent content={content} files={[]} onExplain={onExplain} />);

    fireEvent.click(screen.getByText('Explain'));
    expect(onExplain).toHaveBeenCalledWith(expect.stringContaining(code));
  });

  it('highlights citations matching files', () => {
    const content = 'Reference [lecture.pdf] and [unknown.txt]';
    render(<MessageContent content={content} files={mockFiles} onExplain={vi.fn()} />);

    const knownCitation = screen.getByText('[lecture.pdf]');
    expect(knownCitation).toHaveClass('text-emerald-700');

    const unknownCitation = screen.getByText('[unknown.txt]');
    expect(unknownCitation).toHaveClass('text-indigo-600');
  });
});
