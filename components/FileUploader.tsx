import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileDocument } from '../types';
import { UploadCloud, FileText, Trash2, CheckCircle, Search, AlertTriangle } from './Icons';
import {
  extractFilePreview,
  formatBytes,
  generateId,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_UPLOAD_SIZE_BYTES,
  validateFile,
} from '../utils';

interface FileUploaderProps {
  files: FileDocument[];
  setFiles: React.Dispatch<React.SetStateAction<FileDocument[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, setFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const [fileProgressMessages, setFileProgressMessages] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const totalUploadBytes = useMemo(
    () => files.reduce((sum, file) => sum + (file.sizeBytes ?? 0), 0),
    [files],
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    const incomingFiles = Array.from(uploadedFiles);
    const incomingTotalBytes = incomingFiles.reduce((sum, file) => sum + file.size, 0);

    if (totalUploadBytes + incomingTotalBytes > MAX_TOTAL_UPLOAD_SIZE_BYTES) {
      alert(
        `Upload cancelled: total local source storage would exceed ${formatBytes(
          MAX_TOTAL_UPLOAD_SIZE_BYTES,
        )}. Remove some files first.`,
      );
      event.target.value = '';
      return;
    }

    incomingFiles.forEach((file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }

      const id = generateId();
      const lowerName = file.name.toLowerCase();
      const detectedType: FileDocument['type'] = lowerName.endsWith('.pdf')
        ? 'pdf'
        : lowerName.endsWith('.docx')
          ? 'docx'
          : 'txt';

      const newFile: FileDocument = {
        id: id,
        name: file.name,
        type: detectedType,
        content: '',
        uploadDate: Date.now(),
        status: 'processing',
        progress: 0,
        sizeBytes: file.size,
        isContentTruncated: false,
      };

      setFiles(prev => [...prev, newFile]);
      void simulateIngestionPipeline(id, file);
    });

    event.target.value = '';
  };

  const updateFileById = (id: string, changes: Partial<FileDocument>) => {
    if (!isMountedRef.current) return;
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, ...changes } : file)));
  };

  const clearMessage = (id: string) => {
    if (!isMountedRef.current) return;
    setFileProgressMessages(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updatePipelineStep = (id: string, step: string) => {
    setPipelineSteps(prev => ({ ...prev, [id]: step }));
  };

  const simulateIngestionPipeline = (id: string, file: File) => {
    const updateMessage = (msg: string) => {
      if (!isMountedRef.current) return;
      setFileProgressMessages(prev => ({ ...prev, [id]: msg }));
    };

    updateMessage('Uploading...');
    updateFileById(id, { progress: 15, status: 'processing' });

    setTimeout(() => {
      const lowerName = file.name.toLowerCase();
      updateMessage(lowerName.endsWith('.pdf') ? 'Running OCR & Text Extraction...' : 'Reading Content...');
      updateFileById(id, { progress: 45 });

      extractFilePreview(file)
        .then((preview) => {
          setTimeout(() => {
            updateMessage('Page-aware Chunking & Metadata Extraction...');
            updateFileById(id, { progress: 75 });

            setTimeout(() => {
              updateMessage('Generating Vector Embeddings...');
              updateFileById(id, { progress: 90 });

              setTimeout(() => {
                updateFileById(id, {
                  content: preview.content,
                  status: 'ready',
                  progress: 100,
                  sizeBytes: file.size,
                  previewBytes: preview.previewBytes,
                  isContentTruncated: preview.truncated,
                  errorMessage: undefined,
                });
                clearMessage(id);
              }, 800);
            }, 800);
          }, 800);
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : 'Unknown processing error';
          updateFileById(id, {
            status: 'error',
            progress: 0,
            errorMessage: message,
          });
          updateMessage('Processing failed');
        });
    }, 800);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    setFileProgressMessages(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // ⚡ Bolt Performance Optimization: Memoize filtered files
  // 💡 What: Wrapped `filteredFiles` in `useMemo` and hoisted `searchQuery.toLowerCase()` outside the `.filter` loop.
  // 🎯 Why: Prevents O(N) recalculation of the file list and repetitive string manipulation on every component render.
  // 📊 Impact: Eliminates unnecessary array filtering on non-search related state changes.
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    return files.filter(file => file.name.toLowerCase().includes(query));
  }, [files, searchQuery]);

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Mission Control Sources</h2>
        <p className="text-slate-500">
          Upload textbooks, notes, and transcripts. Files up to {formatBytes(MAX_FILE_SIZE_BYTES)} each are accepted,
          and Study OS indexes safe preview slices to keep the UI fast.
        </p>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload file area"
        className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-primary-500 hover:bg-slate-50 transition-colors cursor-pointer group outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Click or press Enter to upload mission files</h3>
        <p className="text-sm text-slate-500 mt-1">
          Supports PDF, DOCX, TXT, MD, CSV, JSON • Max {formatBytes(MAX_FILE_SIZE_BYTES)} per file
        </p>
        <p className="text-xs text-slate-400 mt-2">Large files are preview-indexed locally so uploads do not overload the site.</p>
        <input 
          type="file" 
          aria-label="Upload files"
          ref={fileInputRef}
          className="hidden" 
          multiple
          accept=".txt,.md,.csv,.json,.pdf,.docx" 
          onChange={handleFileUpload}
          title="File input"
           aria-label="Upload files"
        />
      </div>

      <div className="mt-8 space-y-4">
        {files.length > 0 && (
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="font-semibold text-slate-700">Active Sources ({files.length})</h3>
                <p className="text-xs text-slate-500 mt-1">{formatBytes(totalUploadBytes)} stored in local session</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <label htmlFor="search-files" className="sr-only">Search files</label>
                <input 
                  id="search-files"
                  type="text" 
                  placeholder="Search files..." 
                  aria-label="Search files"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
           </div>
        )}

        {filteredFiles.length === 0 && searchQuery && (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                No files found matching "{searchQuery}"
            </div>
        )}

        {filteredFiles.map(file => (
          <div key={file.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${file.status === 'ready' ? 'bg-indigo-50 text-indigo-600' : file.status === 'error' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                 {file.status === 'processing' ? (
                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                 ) : file.status === 'error' ? (
                    <AlertTriangle className="w-5 h-5" />
                 ) : (
                    <FileText className="w-5 h-5" />
                 )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{file.name}</p>
                {file.status === 'processing' ? (
                     <p className="text-xs text-indigo-600 font-medium animate-pulse">{fileProgressMessages[file.id] || 'Processing...'}</p>
                ) : file.status === 'error' ? (
                    <p className="text-xs text-red-500 truncate">{file.errorMessage || 'Unable to process file'}</p>
                ) : (
                    <p className="text-xs text-slate-500 truncate">
                      {new Date(file.uploadDate).toLocaleDateString()} • {formatBytes(file.sizeBytes ?? file.content.length)} •{' '}
                      {file.isContentTruncated
                        ? `Preview indexed (${formatBytes(file.previewBytes ?? file.sizeBytes ?? 0)} scanned)`
                        : `${file.content.length.toLocaleString()} chars indexed`}
                    </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {file.status === 'ready' && (
                  <span className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Indexed
                  </span>
              )}
              <button 
                onClick={() => removeFile(file.id)}
                aria-label={`Remove file ${file.name}`}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
