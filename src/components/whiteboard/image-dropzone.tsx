
'use client';

import * as React from 'react';
import type { WindowItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UploadCloud, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageDropzoneProps {
  item: WindowItem;
  onUpdate: (item: WindowItem) => void;
}

export function ImageDropzone({ item, onUpdate }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageSrcs, setImageSrcs] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (item.content) {
      try {
        const images = JSON.parse(item.content);
        if (Array.isArray(images)) {
          setImageSrcs(images);
        }
      } catch (e) {
        // Not JSON, might be a single URL from an older version
        setImageSrcs([item.content]);
      }
    }
  }, []);

  const handleFileParse = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newImageSrcs: string[] = [];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    for (const file of Array.from(files)) {
      if (!validImageTypes.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: `Only JPG, PNG, GIF, and WEBP files are supported.`,
        });
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newImageSrcs.push(e.target?.result as string);
        if (newImageSrcs.length === files.length) {
          const updatedSrcs = [...imageSrcs, ...newImageSrcs];
          setImageSrcs(updatedSrcs);
          onUpdate({ ...item, content: JSON.stringify(updatedSrcs), title: `${updatedSrcs.length} Images` });
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
         toast({
          variant: 'destructive',
          title: 'Error Reading File',
          description: `Could not read ${file.name}.`,
        });
        setIsLoading(false);
      }
      reader.readAsDataURL(file);
    }
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

  const handleClearImages = () => {
    setImageSrcs([]);
    onUpdate({ ...item, content: '', title: 'Image Upload' });
  };
  
  if (imageSrcs.length > 0) {
    return (
      <div className="flex h-full flex-col bg-muted/30">
        <ScrollArea className="flex-grow p-4">
          <div className="grid grid-cols-2 gap-4">
            {imageSrcs.map((src, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-md border bg-background shadow-sm">
                <img src={src} alt={`Uploaded image ${index + 1}`} className="h-full w-full object-cover" data-ai-hint="gallery photo" />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-2 flex items-center justify-between">
           <Button variant="outline" size="sm" onClick={handleClearImages}>
             <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
           <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Add More...
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
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
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
      />
      {isLoading ? (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Uploading images...</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-semibold">Drop images here or click to upload</p>
          <p className="text-xs text-muted-foreground">
            Supports: JPG, PNG, GIF, WEBP
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
