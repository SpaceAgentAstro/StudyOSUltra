
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FileUploader from './FileUploader';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

describe('FileUploader', () => {
  const mockSetFiles = vi.fn();
  const defaultProps = {
    files: [],
    setFiles: mockSetFiles
  };

  it('renders upload area', () => {
    render(<FileUploader {...defaultProps} />);
    expect(screen.getByText('Click to upload files')).toBeDefined();
  });

  it('upload area is keyboard accessible', () => {
    render(<FileUploader {...defaultProps} />);
    const uploadArea = screen.getByText('Click to upload files').closest('div');

    // Check if it has tabIndex="0"
    expect(uploadArea?.getAttribute('tabindex')).toBe('0');

    // Check if it has role="button"
    expect(uploadArea?.getAttribute('role')).toBe('button');
  });

  it('triggers file input on Enter key', () => {
    render(<FileUploader {...defaultProps} />);
    const fileInput = screen.getByLabelText(/upload files/i, { selector: 'input[type="file"]' });
    const clickSpy = vi.spyOn(fileInput, 'click');
    const uploadArea = screen.getByText('Click to upload files').closest('div');

    if (uploadArea) {
        fireEvent.keyDown(uploadArea, { key: 'Enter', code: 'Enter' });
        expect(clickSpy).toHaveBeenCalled();
    } else {
        throw new Error('Upload area not found');
    }
  });

  it('has accessible search input', () => {
     const files = [{ id: '1', name: 'test.pdf', type: 'pdf', content: '', uploadDate: Date.now(), status: 'ready', progress: 100 }];
     // @ts-ignore
     render(<FileUploader files={files} setFiles={mockSetFiles} />);
     expect(screen.getByLabelText('Search files')).toBeDefined();
  });

  it('has accessible remove button', () => {
     const files = [{ id: '1', name: 'test.pdf', type: 'pdf', content: '', uploadDate: Date.now(), status: 'ready', progress: 100 }];
     // @ts-ignore
     render(<FileUploader files={files} setFiles={mockSetFiles} />);
     expect(screen.getByLabelText('Remove file test.pdf')).toBeDefined();
  });
});
