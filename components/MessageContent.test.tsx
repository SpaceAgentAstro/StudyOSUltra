import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageContent from './MessageContent';
import { FileDocument } from '../types';

describe('MessageContent', () => {
  const mockOnExplain = vi.fn();
  const mockFiles: FileDocument[] = [
    { id: '1', name: 'test.txt', type: 'txt', content: 'test', uploadDate: 0, status: 'ready' }
  ];

  it('renders plain text', () => {
    render(<MessageContent text="Hello world" files={[]} onExplain={mockOnExplain} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders code blocks', () => {
    const text = 'Here is code:\n```javascript\nconst a = 1;\n```';
    render(<MessageContent text={text} files={[]} onExplain={mockOnExplain} />);

    expect(screen.getByText('Code Snippet')).toBeInTheDocument();
    // The code content might be inside a code tag
    const codeElement = screen.getByText('const a = 1;');
    expect(codeElement).toBeInTheDocument();
  });

  it('calls onExplain when Explain button is clicked', () => {
    const text = '```\ncode\n```';
    render(<MessageContent text={text} files={[]} onExplain={mockOnExplain} />);

    const button = screen.getByRole('button', { name: /explain/i });
    fireEvent.click(button);

    expect(mockOnExplain).toHaveBeenCalledWith(
      expect.stringContaining('Could you explain this code'),
      'TEACHER'
    );
  });

  it('renders citations for files', () => {
    const text = 'Reference [test.txt] here.';
    render(<MessageContent text={text} files={mockFiles} onExplain={mockOnExplain} />);

    const citation = screen.getByText('[test.txt]');
    expect(citation).toBeInTheDocument();
    expect(citation).toHaveClass('text-emerald-700'); // File color style
  });

  it('renders citations for non-files', () => {
    const text = 'Reference [other.pdf] here.';
    render(<MessageContent text={text} files={mockFiles} onExplain={mockOnExplain} />);

    const citation = screen.getByText('[other.pdf]');
    expect(citation).toBeInTheDocument();
    expect(citation).toHaveClass('text-indigo-600'); // Regular citation style
  });
});
