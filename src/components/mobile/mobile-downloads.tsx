"use client";

import { useState } from "react";
import {
  Download,
  Play,
  Trash2,
  FileAudio,
  Archive,
  Share2,
} from "lucide-react";
import { MobileCard } from "./mobile-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DownloadItem {
  id: string;
  name: string;
  size: string;
  date: string;
  type: "audio" | "project";
  url?: string;
}

interface MobileDownloadsProps {
  audioUrl?: string;
  onDownloadAudio: () => void;
  //  onDownloadProject: () => void
  onShareAudio: () => void;
  projectInfo?: {
    fileName: string;
    fileSizeFormatted: string;
    exists: boolean;
  };
}

export function MobileDownloads({
  audioUrl,
  onDownloadAudio,
  //  onDownloadProject,
  onShareAudio,
  projectInfo,
}: MobileDownloadsProps) {
  // Mock download history - in a real app, this would come from storage
  const [downloadHistory] = useState<DownloadItem[]>([
    {
      id: "1",
      name: "Welcome Message",
      size: "2.3 MB",
      date: "2 hours ago",
      type: "audio",
      url: "/audio/welcome.mp3",
    },
    {
      id: "2",
      name: "Product Demo",
      size: "5.1 MB",
      date: "1 day ago",
      type: "audio",
      url: "/audio/demo.mp3",
    },
  ]);

  const availableDownloads: DownloadItem[] = [];

  // Add current audio if available
  if (audioUrl) {
    availableDownloads.push({
      id: "current-audio",
      name: "Current Audio",
      size: "~1.5 MB",
      date: "Now",
      type: "audio",
      url: audioUrl,
    });
  }

  // Add project if available
  if (projectInfo?.exists) {
    availableDownloads.push({
      id: "project",
      name: "Complete Project",
      size: projectInfo.fileSizeFormatted,
      date: "Now",
      type: "project",
    });
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "audio":
        return <FileAudio className="h-5 w-5 text-blue-600" />;
      case "project":
        return <Archive className="h-5 w-5 text-green-600" />;
      default:
        return <Download className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "audio":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Audio
          </Badge>
        );
      case "project":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Project
          </Badge>
        );
      default:
        return <Badge variant="secondary">File</Badge>;
    }
  };

  return (
    <div className="pb-20">
      {/* Available Downloads */}
      {availableDownloads.length > 0 && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Downloads
          </h2>

          <div className="space-y-3">
            {availableDownloads.map((item) => (
              <MobileCard
                key={item.id}
                icon={getTypeIcon(item.type)}
                title={item.name}
                subtitle={`${item.size} • ${item.date}`}
                rightElement={
                  <div className="flex items-center gap-2">
                    {getTypeBadge(item.type)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (item.type === "audio") {
                          if (item.id === "current-audio") {
                            onDownloadAudio();
                          }
                        }
                        // else if (item.type === "project") {
                        //   onDownloadProject();
                        // }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {item.type === "audio" && item.id === "current-audio" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onShareAudio}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                }
                className="border-green-200 bg-green-50"
              />
            ))}
          </div>
        </div>
      )}

      {/* Download History */}
      {downloadHistory.length > 0 && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Download History
          </h2>

          <div className="space-y-3">
            {downloadHistory.map((item) => (
              <MobileCard
                key={item.id}
                icon={getTypeIcon(item.type)}
                title={item.name}
                subtitle={`${item.size} • ${item.date}`}
                rightElement={
                  <div className="flex items-center gap-2">
                    {getTypeBadge(item.type)}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {availableDownloads.length === 0 && downloadHistory.length === 0 && (
        <div className="px-4 py-12 text-center">
          <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Downloads Available
          </h3>
          <p className="text-gray-500">
            Generate some audio or download the project to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
