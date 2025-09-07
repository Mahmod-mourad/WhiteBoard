
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddWebsiteLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddLink: (link: string) => void;
}

export function AddWebsiteLinkDialog({ isOpen, onOpenChange, onAddLink }: AddWebsiteLinkDialogProps) {
  const [link, setLink] = React.useState<string>('');

  const handleSubmit = () => {
    if (link.trim() !== '') {
      onAddLink(link);
    }
    onOpenChange(false);
    setLink(''); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Website Link</DialogTitle>
          <DialogDescription>
            Enter the URL of the website you want to add to the whiteboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="website-link" className="text-right">
              Link
            </Label>
            <Input
              id="website-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Add Website</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
