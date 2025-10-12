'use client'

import { ArrowLeft, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AppBarProps {
  title: string
  showBackButton?: boolean
  onBackClick?: () => void
  actions?: React.ReactNode
  className?: string
}

export function AppBar({ 
  title, 
  showBackButton = false, 
  onBackClick, 
  actions,
  className 
}: AppBarProps) {
  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40",
      "md:hidden", // Only show on mobile
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side - Back button */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>
    </div>
  )
}