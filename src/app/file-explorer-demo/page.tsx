"use client";

import React, { useState, useEffect } from "react";
import { FileExplorer, FileItem } from "@/components/file-explorer";
import { useToast } from "@/hooks/use-toast";

export default function FileExplorerDemo() {
  const [selectedContent, setSelectedContent] = useState<FileItem | null>(null);
  const [predefinedContent, setPredefinedContent] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch ebook data from API
    const fetchEbooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/ebooks?t=${Date.now()}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (result.success) {
          setPredefinedContent(result.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load ebooks",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching ebooks:", error);
        toast({
          title: "Error",
          description: "Failed to fetch ebook data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEbooks();
  }, [toast]);

  const handleUploadClick = () => {
    toast({
      title: "Upload Feature",
      description: "File upload feature would be implemented here",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📚 eBook Content Library
          </h1>
          <p className="text-lg text-gray-600">
            Browse predefined eBooks and episodes, or upload your own content
            for text-to-speech conversion
          </p>
        </div>

        {/* File Explorer Component with both sections */}
        <FileExplorer
          items={[]}
          predefinedItems={predefinedContent}
          onFileSelect={(file) => {
            console.log("Selected file:", file);
            setSelectedContent(file);
            if (file.type === "file") {
              toast({
                title: "Content Loaded",
                description: `"${file.name}" is ready for text-to-speech conversion`,
              });
            }
          }}
          onUploadClick={handleUploadClick}
          defaultContent={
            isLoading
              ? "Loading ebooks..."
              : "👉 Select an eBook from the Predefined section to view episodes, or upload your own content"
          }
        />
      </div>
    </div>
  );
}
