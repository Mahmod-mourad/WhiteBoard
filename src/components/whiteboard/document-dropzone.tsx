
'use client';

import * as React from 'react';
import type { WindowItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';


const pdfjsPromise = import('pdfjs-dist');
import mammoth from 'mammoth';

pdfjsPromise.then(mod => {
    // Some bundlers may place named exports on the module object; handle both shapes
    const GlobalWorkerOptions = (mod as any).GlobalWorkerOptions ?? (mod as any).default?.GlobalWorkerOptions;
    const version = (mod as any).version ?? (mod as any).default?.version;
    if (GlobalWorkerOptions && version) {
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
    }
});

interface DocumentDropzoneProps {
  item: WindowItem;
  onUpdate: (item: WindowItem) => void;
}

type ParsedDocument = {
  name: string;
  content: string;
};

export function DocumentDropzone({ item, onUpdate }: DocumentDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [parsedDocuments, setParsedDocuments] = React.useState<ParsedDocument[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // When the component loads, try to parse existing content
    if (item.content) {
      try {
        const docs = JSON.parse(item.content);
        if (Array.isArray(docs)) {
          setParsedDocuments(docs);
        }
      } catch (e) {
        // Not JSON, so it might be a plain text from the old version
        setParsedDocuments([{ name: 'document.txt', content: item.content }]);
      }
    }
  }, []); // Only run once on mount

  const handleFileParse = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newDocs: ParsedDocument[] = [];

    for (const file of Array.from(files)) {
      try {
        let textContent = '';
        if (file.type === 'application/pdf') {
          const mod = await pdfjsPromise;
          const getDocument = (mod as any).getDocument ?? (mod as any).default?.getDocument;
          const pdf = await getDocument(await file.arrayBuffer()).promise;
          let content = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            content += text.items.map((s: any) => s.str).join(' ');
          }
          textContent = content;
        } else if (file.type.includes('wordprocessingml')) { // .docx
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          textContent = result.value;
        } else if (file.type.startsWith('text/')) { // .txt
          textContent = await file.text();
        } else {
          toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: `File type for ${file.name} is not supported.`,
          });
          continue; // Skip unsupported files
        }
        newDocs.push({ name: file.name, content: textContent });
      } catch (error) {
        console.error('Error parsing file:', error);
        toast({
          variant: 'destructive',
          title: 'Error Parsing File',
          description: `Could not parse ${file.name}.`,
        });
      }
    }
    
    const updatedDocs = [...parsedDocuments, ...newDocs];
    setParsedDocuments(updatedDocs);
    onUpdate({ ...item, content: JSON.stringify(updatedDocs), title: updatedDocs.length > 1 ? `${updatedDocs.length} Documents` : updatedDocs[0]?.name || 'Document Upload' });
    setIsLoading(false);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileParse(e.dataTransfer.files);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileParse(e.target.files);
  }

  const handleClearDocuments = () => {
    setParsedDocuments([]);
    onUpdate({ ...item, content: '', title: 'Document Upload' });
  };
  
  if (parsedDocuments.length > 0) {
    return (
      <div className="flex h-full flex-col">
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {parsedDocuments.map((doc, index) => (
              <div key={index} className="rounded-md border bg-muted/50 p-3">
                <h4 className="font-semibold text-sm mb-1 truncate flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  {doc.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-3">{doc.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-2 flex items-center justify-between">
           <Button variant="outline" size="sm" onClick={handleClearDocuments}>
            Clear Documents
          </Button>
           <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Add More...
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".txt,.pdf,.docx"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".txt,.pdf,.docx"
        onChange={handleFileSelect}
      />
      {isLoading ? (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Parsing files...</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-semibold">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground">
            Supports: .txt, .pdf, .docx
          </p>
           <Button 
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
        </>
      )}
    </div>
  );
}
