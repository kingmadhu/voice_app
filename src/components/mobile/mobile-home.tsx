'use client'

import { useState } from 'react'
import { Play, Mic, Upload, FileText, Headphones, Zap, Settings, Download } from 'lucide-react'
import { MobileCard } from './mobile-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface MobileHomeProps {
  text: string
  setText: (text: string) => void
  selectedVoice: string
  onVoiceSelect: () => void
  isPlaying: boolean
  isProcessing: boolean
  onPlay: () => void
  onStop: () => void
  onUpload: () => void
  audioUrl?: string
  progress: number
  currentVoiceName?: string
}

export function MobileHome({
  text,
  setText,
  selectedVoice,
  onVoiceSelect,
  isPlaying,
  isProcessing,
  onPlay,
  onStop,
  onUpload,
  audioUrl,
  progress,
  currentVoiceName
}: MobileHomeProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop
  }

  return (
    <div className="pb-20">
      {/* Quick Actions Section */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <MobileCard
            onClick={onPlay}
            icon={<Play className="h-5 w-5 text-blue-600" />}
            title="Quick Play"
            subtitle="Start TTS"
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          
          <MobileCard
            onClick={onVoiceSelect}
            icon={<Mic className="h-5 w-5 text-purple-600" />}
            title="Voice"
            subtitle={currentVoiceName || "Select voice"}
            rightElement={
              currentVoiceName && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )
            }
          />
          
          <MobileCard
            onClick={onUpload}
            icon={<Upload className="h-5 w-5 text-green-600" />}
            title="Upload File"
            subtitle="PDF, DOC, TXT"
          />
          
          {audioUrl && (
            <MobileCard
              icon={<Download className="h-5 w-5 text-orange-600" />}
              title="Download"
              subtitle="Get MP3"
            />
          )}
        </div>
      </div>

      {/* Text Input Section */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Text to Speech
        </h2>
        
        <MobileCard className="min-h-[200px]">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200",
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here or drag and drop a file..."
              className="w-full h-32 bg-transparent border-none resize-none outline-none text-gray-700 placeholder-gray-400"
              disabled={isProcessing}
            />
            
            {!text && (
              <div className="mt-4">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Drag & drop or type your text
                </p>
              </div>
            )}
          </div>
          
          {text && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {text.length} characters
              </span>
              <Button
                onClick={onPlay}
                disabled={isProcessing || !text.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          )}
        </MobileCard>
      </div>

      {/* Progress Section */}
      {(isProcessing || isPlaying) && (
        <div className="px-4 py-6">
          <MobileCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="animate-pulse">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {isProcessing ? 'Processing...' : 'Playing...'}
                </h3>
                <p className="text-sm text-gray-500">
                  {progress}% complete
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </MobileCard>
        </div>
      )}

      {/* Status Section */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Status
        </h2>
        
        <div className="space-y-3">
          <MobileCard
            icon={<Headphones className="h-5 w-5 text-blue-600" />}
            title="Voice Engine"
            subtitle={currentVoiceName || "Not selected"}
          />
          
          <MobileCard
            icon={<Settings className="h-5 w-5 text-gray-600" />}
            title="Settings"
            subtitle="Configure voice settings"
          />
        </div>
      </div>
    </div>
  )
}