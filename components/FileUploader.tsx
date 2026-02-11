
import React, { useRef, useState } from 'react';
import { FileDocument } from '../types';
import { UploadCloud, FileText, Trash2, CheckCircle, Search, AlertTriangle, X } from './Icons';
import { generateId, validateFile } from '../utils';

interface FileUploaderProps {
  files: FileDocument[];
  setFiles: React.Dispatch<React.SetStateAction<FileDocument[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, setFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    setUploadError(null);

    Array.from(uploadedFiles).forEach((file: File) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'Invalid file');
        return;
      }

      const id = generateId();
      
      const newFile: FileDocument = {
        id: id,
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : 'txt',
        content: '', 
        uploadDate: Date.now(),
        status: 'processing',
        progress: 0
      };

      setFiles(prev => [...prev, newFile]);
      simulateIngestionPipeline(id, file);
    });
  };

  const simulateIngestionPipeline = (id: string, file: File) => {
    setProcessingId(id);
    
    // Step 1: Uploading
    setPipelineStep('Uploading...');
    setTimeout(() => {
        // Step 2: OCR / Text Extraction
        setPipelineStep(file.name.endsWith('.pdf') ? 'Running OCR & Text Extraction...' : 'Reading Content...');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            
            setTimeout(() => {
                // Step 3: Chunking
                setPipelineStep('Page-aware Chunking & Metadata Extraction...');
                
                setTimeout(() => {
                    // Step 4: Vector Embeddings
                    setPipelineStep('Generating Vector Embeddings...');
                    
                    setTimeout(() => {
                        setFiles(prev => prev.map(f => f.id === id ? { ...f, content: text, status: 'ready', progress: 100 } : f));
                        setProcessingId(null);
                        setPipelineStep('');
                    }, 800);
                }, 800);
            }, 800);
        };
        reader.readAsText(file);

    }, 800);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sources & Knowledge Base</h2>
        <p className="text-slate-500">Upload textbooks, notes, and transcripts. Study OS will ground all answers in these files to prevent hallucinations.</p>
      </div>

      <div 
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-primary-500 hover:bg-slate-50 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Click to upload files</h3>
        <p className="text-sm text-slate-500 mt-1">Supports PDF, DOCX, TXT, MD</p>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          multiple
          accept=".txt,.md,.csv,.json,.pdf,.docx" 
          onChange={handleFileUpload}
        />
      </div>

      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 text-red-500" />
             <p className="text-sm font-medium text-red-700">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {files.length > 0 && (
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <h3 className="font-semibold text-slate-700">Active Sources ({files.length})</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  aria-label="Search files"
                  placeholder="Search files..." 
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
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${file.status === 'ready' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                 {file.status === 'processing' ? (
                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                    <FileText className="w-5 h-5" />
                 )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{file.name}</p>
                {file.status === 'processing' ? (
                     <p className="text-xs text-indigo-600 font-medium animate-pulse">{pipelineStep || 'Processing...'}</p>
                ) : (
                    <p className="text-xs text-slate-500 truncate">
                    {new Date(file.uploadDate).toLocaleDateString()} • {file.content.length} chars • Ready for RAG
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
                aria-label={`Delete ${file.name}`}
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
