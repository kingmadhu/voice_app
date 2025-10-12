'use client'

import { useState } from 'react'
import { Check, Play, User, Volume2 } from 'lucide-react'
import { MobileCard } from './mobile-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Voice {
  id: string
  name: string
  language: string
  gender: string
  source: 'local' | 'online' | 'browser'
  isDefault?: boolean
}

interface MobileVoiceSelectorProps {
  voices: Voice[]
  selectedVoice: string
  onVoiceSelect: (voiceId: string) => void
  onPreview: (voiceId: string) => void
  onClose: () => void
}

export function MobileVoiceSelector({
  voices,
  selectedVoice,
  onVoiceSelect,
  onPreview,
  onClose
}: MobileVoiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'browser' | 'online'>('all')

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.language.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || voice.source === filter
    return matchesSearch && matchesFilter
  })

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'browser': return 'bg-purple-100 text-purple-800'
      case 'online': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'browser': return 'Local'
      case 'online': return 'Online'
      default: return 'Unknown'
    }
  }

  return (
    <div className="pb-20">
      {/* Search and Filter */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Search voices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div className="flex gap-2">
            {(['all', 'browser', 'online'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="flex-1"
              >
                {filterType === 'all' ? 'All' : 
                 filterType === 'browser' ? 'Local' : 'Online'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice List */}
      <div className="px-4 py-4">
        <div className="space-y-3">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoice === voice.id
            
            return (
              <MobileCard
                key={voice.id}
                onClick={() => onVoiceSelect(voice.id)}
                icon={
                  <div className="relative">
                    <User className={cn(
                      "h-5 w-5",
                      isSelected ? "text-blue-600" : "text-gray-600"
                    )} />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                }
                title={voice.name}
                subtitle={`${voice.language} • ${voice.gender}`}
                rightElement={
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getSourceColor(voice.source))}
                    >
                      {getSourceLabel(voice.source)}
                    </Badge>
                    {voice.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreview(voice.id)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                }
                className={cn(
                  "transition-all duration-200",
                  isSelected && [
                    "border-blue-500 bg-blue-50",
                    "shadow-md"
                  ]
                )}
              />
            )
          })}
        </div>
        
        {filteredVoices.length === 0 && (
          <div className="text-center py-8">
            <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No voices found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}