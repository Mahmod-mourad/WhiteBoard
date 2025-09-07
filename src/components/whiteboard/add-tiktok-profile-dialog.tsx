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

interface AddTiktokProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddProfile: (link: string) => void;
}

export function AddTiktokProfileDialog({ isOpen, onOpenChange, onAddProfile }: AddTiktokProfileDialogProps) {
  const [link, setLink] = React.useState<string>('');

  const handleSubmit = () => {
    if (link.trim() !== '') {
      onAddProfile(link);
    }
    onOpenChange(false);
    setLink(''); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add TikTok Profile</DialogTitle>
          <DialogDescription>
            Enter the URL of the TikTok profile you want to add to the whiteboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tiktok-profile-link" className="text-right">
              Link
            </Label>
            <Input
              id="tiktok-profile-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
              placeholder="https://www.tiktok.com/@..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Add Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
