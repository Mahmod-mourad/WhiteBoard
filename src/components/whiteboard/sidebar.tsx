
'use client';

import * as React from 'react';
import type { WindowType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Youtube, FileText, Image as ImageIcon, Globe, MessageCircle } from 'lucide-react';
import { AddLinksDialog } from './add-links-dialog';
import { AddPlaylistDialog } from './add-playlist-dialog';
import { AddTiktokProfileDialog } from './add-tiktok-profile-dialog';
import { AddChannelDialog } from './add-channel-dialog';
import { AddTiktokReelDialog } from './add-tiktok-reel-dialog';
import { AddInstagramProfileDialog } from './add-instagram-profile-dialog';
import { AddInstagramReelDialog } from './add-instagram-reel-dialog';
import { AddWebsiteLinkDialog } from './add-website-link-dialog';

interface SidebarProps {
  onAddItem: (type: WindowType, content?: string | string[]) => void;
}

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16.5 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"/>
        <path d="M12 15.5v-9"/>
        <path d="M12 15.5a4.5 4.5 0 1 0 4.5-4.5"/>
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
);

export function Sidebar({ onAddItem }: SidebarProps) {
  const [isAddLinksDialogOpen, setIsAddLinksDialogOpen] = React.useState(false);
  const [isAddPlaylistDialogOpen, setIsAddPlaylistDialogOpen] = React.useState(false);
  const [isAddTiktokProfileDialogOpen, setisAddTiktokProfileDialogOpen] = React.useState(false);
  const [isAddTiktokReelDialogOpen, setIsAddTiktokReelDialogOpen] = React.useState(false);
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = React.useState(false);
  const [isAddInstagramProfileDialogOpen, setIsAddInstagramProfileDialogOpen] = React.useState(false);
  const [isAddInstagramReelDialogOpen, setIsAddInstagramReelDialogOpen] = React.useState(false);
  const [isAddWebsiteLinkDialogOpen, setIsAddWebsiteLinkDialogOpen] = React.useState(false);
  
  const toolButtons = [
     { type: 'doc', icon: FileText, tooltip: 'Document'},
     { type: 'url', icon: Globe, tooltip: 'Website / URL', action: () => setIsAddWebsiteLinkDialogOpen(true) },
     { type: 'image', icon: ImageIcon, tooltip: 'Image'},
  ]

  const handleAddLinks = (links: string[]) => {
    onAddItem('youtube', links);
  };
  
  const handleAddPlaylist = (link: string) => {
    onAddItem('youtube', link);
  }

  const handleAddTiktokProfile = (link: string) => {
    onAddItem('tiktok', link);
  }
  
  const handleAddTiktokReel = (links: string[]) => {
    onAddItem('tiktok', links);
  }

  const handleAddChannel = (link: string) => {
    onAddItem('youtube', link);
  }

  const handleAddInstagramProfile = (link: string) => {
    onAddItem('instagram', link);
  }

  const handleAddInstagramReel = (links: string[]) => {
    onAddItem('instagram', links);
  }
  
  const handleAddWebsiteLink = (link: string) => {
    onAddItem('url', link);
  }

  return (
    <TooltipProvider>
      <aside className="fixed top-1/2 left-4 z-50 -translate-y-1/2 rounded-full border bg-card/90 p-2 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-primary/20 text-primary hover:bg-primary/30 h-12 w-12" onClick={() => onAddItem('ai')}>
                        <MessageCircle className="h-6 w-6" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Chat</TooltipContent>
            </Tooltip>
            
            <div className="my-2 h-px w-8 bg-border" />

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Youtube className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">YouTube</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="center">
                <DropdownMenuItem onSelect={() => setIsAddPlaylistDialogOpen(true)}>
                  Playlist
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsAddChannelDialogOpen(true)}>
                  Channel
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsAddLinksDialogOpen(true)}>
                  Video Link(s)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <TikTokIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">TikTok</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="center">
                <DropdownMenuItem onSelect={() => setisAddTiktokProfileDialogOpen(true)}>
                  Tiktok profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsAddTiktokReelDialogOpen(true)}>
                  Reel link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <InstagramIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">Instagram</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="center">
                <DropdownMenuItem onSelect={() => setIsAddInstagramProfileDialogOpen(true)}>
                  Profile link
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsAddInstagramReelDialogOpen(true)}>
                  Reel link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {toolButtons.map(tool => (
                 <Tooltip key={tool.tooltip}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => tool.action ? tool.action() : onAddItem(tool.type as WindowType)}>
                            <tool.icon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{tool.tooltip}</TooltipContent>
                </Tooltip>
            ))}
        </div>
      </aside>
      <AddLinksDialog 
        isOpen={isAddLinksDialogOpen}
        onOpenChange={setIsAddLinksDialogOpen}
        onAddItems={handleAddLinks}
      />
      <AddPlaylistDialog 
        isOpen={isAddPlaylistDialogOpen}
        onOpenChange={setIsAddPlaylistDialogOpen}
        onAddPlaylist={handleAddPlaylist}
      />
       <AddTiktokProfileDialog
        isOpen={isAddTiktokProfileDialogOpen}
        onOpenChange={setisAddTiktokProfileDialogOpen}
        onAddProfile={handleAddTiktokProfile}
      />
      <AddTiktokReelDialog
        isOpen={isAddTiktokReelDialogOpen}
        onOpenChange={setIsAddTiktokReelDialogOpen}
        onAddReel={handleAddTiktokReel}
      />
      <AddChannelDialog
        isOpen={isAddChannelDialogOpen}
        onOpenChange={setIsAddChannelDialogOpen}
        onAddChannel={handleAddChannel}
      />
      <AddInstagramProfileDialog
        isOpen={isAddInstagramProfileDialogOpen}
        onOpenChange={setIsAddInstagramProfileDialogOpen}
        onAddProfile={handleAddInstagramProfile}
      />
      <AddInstagramReelDialog
        isOpen={isAddInstagramReelDialogOpen}
        onOpenChange={setIsAddInstagramReelDialogOpen}
        onAddReel={handleAddInstagramReel}
      />
      <AddWebsiteLinkDialog
        isOpen={isAddWebsiteLinkDialogOpen}
        onOpenChange={setIsAddWebsiteLinkDialogOpen}
        onAddLink={handleAddWebsiteLink}
      />
    </TooltipProvider>
  );
}
