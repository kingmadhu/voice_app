'use client'

import { ChevronRight, Download, Upload, RotateCcw, Info, Smartphone } from 'lucide-react'
import { MobileCard } from './mobile-card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
}

interface MobileSettingsProps {
  voiceSettings: VoiceSettings
  onVoiceSettingsChange: (settings: VoiceSettings) => void
  onDownloadProject: () => void
  onExportSettings: () => void
  onImportSettings: () => void
  onClearAll: () => void
  isMobile: boolean
  projectInfo?: {
    fileName: string
    fileSizeFormatted: string
    exists: boolean
  }
}

export function MobileSettings({
  voiceSettings,
  onVoiceSettingsChange,
  onDownloadProject,
  onExportSettings,
  onImportSettings,
  onClearAll,
  isMobile,
  projectInfo
}: MobileSettingsProps) {
  return (
    <div className="pb-20">
      {/* Voice Controls */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Voice Controls
        </h2>
        
        <MobileCard>
          <div className="space-y-6">
            {/* Rate Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Rate</Label>
                <span className="text-sm text-gray-500">
                  {voiceSettings.rate.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[voiceSettings.rate]}
                onValueChange={(value) => 
                  onVoiceSettingsChange({ ...voiceSettings, rate: value[0] })
                }
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Pitch Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Pitch</Label>
                <span className="text-sm text-gray-500">
                  {voiceSettings.pitch.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[voiceSettings.pitch]}
                onValueChange={(value) => 
                  onVoiceSettingsChange({ ...voiceSettings, pitch: value[0] })
                }
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Volume</Label>
                <span className="text-sm text-gray-500">
                  {Math.round(voiceSettings.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[voiceSettings.volume]}
                onValueChange={(value) => 
                  onVoiceSettingsChange({ ...voiceSettings, volume: value[0] })
                }
                min={0}
                max={1.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </MobileCard>
      </div>

      {/* Data Management */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Data Management
        </h2>
        
        <div className="space-y-3">
          <MobileCard
            icon={<Download className="h-5 w-5 text-blue-600" />}
            title="Download Project"
            subtitle={projectInfo?.exists ? projectInfo.fileSizeFormatted : "Not available"}
            rightElement={
              projectInfo?.exists && (
                <Badge variant="secondary" className="text-xs">
                  Ready
                </Badge>
              )
            }
            onClick={onDownloadProject}
          />
          
          <MobileCard
            icon={<Upload className="h-5 w-5 text-green-600" />}
            title="Export Settings"
            subtitle="Save voice configuration"
            onClick={onExportSettings}
          />
          
          <MobileCard
            icon={<Download className="h-5 w-5 text-purple-600" />}
            title="Import Settings"
            subtitle="Load voice configuration"
            onClick={onImportSettings}
          />
          
          <MobileCard
            icon={<RotateCcw className="h-5 w-5 text-red-600" />}
            title="Clear All Data"
            subtitle="Reset application"
            onClick={onClearAll}
          />
        </div>
      </div>

      {/* Device Info */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Device Information
        </h2>
        
        <MobileCard
          icon={<Smartphone className="h-5 w-5 text-gray-600" />}
          title="Mobile Mode"
          subtitle={isMobile ? "Enabled" : "Disabled"}
          rightElement={
            <Switch
              checked={isMobile}
              disabled
              className="pointer-events-none"
            />
          }
        />
        
        <MobileCard
          icon={<Info className="h-5 w-5 text-blue-600" />}
          title="About"
          subtitle="Voice Studio v1.0"
          rightElement={<ChevronRight className="h-4 w-4 text-gray-400" />}
        />
      </div>
    </div>
  )
}