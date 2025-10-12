'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface MobileCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  onClick?: () => void
  icon?: React.ReactNode
  rightElement?: React.ReactNode
  className?: string
  contentClassName?: string
}

export function MobileCard({ 
  children, 
  title, 
  subtitle, 
  onClick, 
  icon, 
  rightElement,
  className,
  contentClassName 
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform duration-150",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn("p-4", contentClassName)}>
        {(title || icon || rightElement) && (
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-medium text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {rightElement && (
              <div className="flex-shrink-0">
                {rightElement}
              </div>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}