'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { Search, Save, Share, Download, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  projectName?: string;
}

export function TopBar({ 
  searchQuery, 
  onSearchChange, 
  onSave, 
  onExport, 
  onShare,
  projectName = "Untitled Whiteboard"
}: TopBarProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        
        {/* Left Section - Project Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">W</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm text-foreground truncate">
                {projectName}
              </h1>
              <p className="text-xs text-muted-foreground">
                Whiteboard
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-2">
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSave}
              title="Save (Ctrl+S)"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Save</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExport}
              title="Export"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Export</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShare}
              title="Share"
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Share</span>
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
