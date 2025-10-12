'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

interface FabProps {
  onClick: () => void
  icon: React.ReactNode
  label?: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Fab({ 
  onClick, 
  icon, 
  label, 
  variant = 'primary',
  className 
}: FabProps) {
  const { triggerHaptic } = useHapticFeedback()

  const handleClick = () => {
    triggerHaptic('medium')
    onClick()
  }

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40",
        "md:hidden", // Only show on mobile
        "active:scale-95 transition-transform duration-150",
        variant === 'primary' && [
          "bg-blue-600 hover:bg-blue-700 text-white",
          "hover:scale-110 active:scale-95"
        ],
        variant === 'secondary' && [
          "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
        ],
        className
      )}
      size="icon"
    >
      <div className="h-6 w-6">
        {icon}
      </div>
      {label && (
        <span className="sr-only">
          {label}
        </span>
      )}
    </Button>
  )
}