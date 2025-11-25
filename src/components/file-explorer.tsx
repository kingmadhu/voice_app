"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  FolderOpen,
  Upload,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Define the structure for file/folder items
export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string; // Content for files
  children?: FileItem[]; // Sub-items for folders
}

interface FileExplorerProps {
  items: FileItem[];
  predefinedItems?: FileItem[];
  onFileSelect?: (file: FileItem) => void;
  onUploadClick?: () => void;
  defaultContent?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  items,
  predefinedItems = [],
  onFileSelect,
  onUploadClick,
  defaultContent = "Select a file to view its content",
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeSection, setActiveSection] = useState<"upload" | "predefined">(
    "predefined"
  );

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const renderTreeItem = (item: FileItem, depth: number = 0) => {
    const isFolder = item.type === "folder";
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = isFolder && item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className="flex items-center"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {isFolder ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200"
                onClick={() => toggleFolder(item.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant={selectedFile?.id === item.id ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2 justify-start flex-1"
                onClick={() => handleFileClick(item)}
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-600" />
                ) : (
                  <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-500" />
                )}
                <span className="truncate">{item.name}</span>
              </Button>
            </>
          ) : (
            <>
              <div className="w-6" /> {/* Placeholder for indent alignment */}
              <Button
                variant={selectedFile?.id === item.id ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2 justify-start flex-1"
                onClick={() => handleFileClick(item)}
              >
                <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                <span className="truncate">{item.name}</span>
              </Button>
            </>
          )}
        </div>

        {isFolder && isExpanded && hasChildren && (
          <div>
            {item.children!.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Tree Panel */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-yellow-600" />
            Content Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeSection === "upload" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveSection("upload")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button
              variant={activeSection === "predefined" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveSection("predefined")}
            >
              <Book className="h-4 w-4 mr-2" />
              Predefined
            </Button>
          </div>

          <Separator />

          {/* Upload Section */}
          {activeSection === "upload" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Upload your own files to convert to speech
              </p>
              <Button
                onClick={onUploadClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {items.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {items.map((item) => renderTreeItem(item))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Predefined Section */}
          {activeSection === "predefined" && (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {predefinedItems.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No predefined content available
                </p>
              ) : (
                predefinedItems.map((item) => renderTreeItem(item))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Display Panel */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {selectedFile ? (
              <div className="flex items-center gap-2">
                <span>{selectedFile.name}</span>
                {selectedFile.type === "folder" && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Folder
                  </span>
                )}
              </div>
            ) : (
              <span>Content Preview</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="space-y-4">
              {selectedFile.type === "file" && selectedFile.content ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                    {selectedFile.content}
                  </pre>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
                  {selectedFile.type === "folder"
                    ? "This is a folder. Click on files inside to view their content."
                    : "No content available for this file."}
                </div>
              )}

              {/* File Info */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span className="text-gray-700">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="text-gray-700 capitalize">
                    {selectedFile.type}
                  </span>
                </div>
                {selectedFile.type === "file" && (
                  <div className="flex justify-between">
                    <span className="font-medium">Size:</span>
                    <span className="text-gray-700">
                      {selectedFile.content
                        ? `${selectedFile.content.length} bytes`
                        : "N/A"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{defaultContent}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
