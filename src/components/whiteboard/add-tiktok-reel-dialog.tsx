
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
import { Plus, X } from 'lucide-react';

interface AddTiktokReelDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddReel: (links: string[]) => void;
}

export function AddTiktokReelDialog({ isOpen, onOpenChange, onAddReel }: AddTiktokReelDialogProps) {
  const [links, setLinks] = React.useState<string[]>(['']);

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleAddLinkInput = () => {
    setLinks([...links, '']);
  };

  const handleRemoveLinkInput = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const handleSubmit = () => {
    const validLinks = links.filter(link => link.trim() !== '');
    if (validLinks.length > 0) {
      onAddReel(validLinks);
    }
    onOpenChange(false);
    setLinks(['']); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add TikTok Reels</DialogTitle>
          <DialogDescription>
            Enter one or more TikTok reel URLs. Each will be added as a new window.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                placeholder="https://www.tiktok.com/@user/video/..."
              />
              {links.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveLinkInput(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={handleAddLinkInput} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add another link
          </Button>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Add Reels</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
