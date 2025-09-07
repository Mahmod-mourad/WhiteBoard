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

interface AddChannelDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddChannel: (link: string) => void;
}

export function AddChannelDialog({ isOpen, onOpenChange, onAddChannel }: AddChannelDialogProps) {
  const [link, setLink] = React.useState<string>('');

  const handleSubmit = () => {
    if (link.trim() !== '') {
      onAddChannel(link);
    }
    onOpenChange(false);
    setLink(''); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add YouTube Channel</DialogTitle>
          <DialogDescription>
            Enter the URL of the YouTube channel you want to add to the whiteboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel-link" className="text-right">
              Link
            </Label>
            <Input
              id="channel-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
              placeholder="https://www.youtube.com/channel/..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Add Channel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
