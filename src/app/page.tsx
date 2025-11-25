"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Play,
  Pause,
  Download,
  Volume2,
  FileText,
  Loader2,
  Square,
  RotateCcw,
  TestTube,
  Mic,
  Sparkles,
  Zap,
  Headphones,
  Settings,
  Sliders,
  Save,
  Trash2,
  Share2,
  Plus,
  Radio,
  User,
  Smartphone,
  Archive,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Book,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mobile components
import { useMobileEnhanced } from "@/hooks/use-mobile-enhanced";
import { BottomNavigation } from "@/components/mobile/bottom-navigation";
import { AppBar } from "@/components/mobile/app-bar";
import { Fab } from "@/components/mobile/fab";
import { MobileHome } from "@/components/mobile/mobile-home";
import { MobileVoiceSelector } from "@/components/mobile/mobile-voice-selector";
import { MobileSettings } from "@/components/mobile/mobile-settings";
import { MobileDownloads } from "@/components/mobile/mobile-downloads";

// File Explorer
import { FileItem } from "@/components/file-explorer";

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  source: "local" | "online" | "browser";
  isDefault?: boolean;
  voiceURI?: string;
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
}

interface PodcastSegment {
  id: string;
  voiceId: string;
  text: string;
  voice: Voice;
}

interface VoiceProfile {
  id: string;
  name: string;
  settings: VoiceSettings;
  voiceId: string;
  createdAt: Date;
}

const fallbackVoices: Voice[] = [
  // Online voices (using free TTS APIs)
  {
    id: "online-1",
    name: "Emma (Natural)",
    language: "en-US",
    gender: "Female",
    source: "online",
  },
];

// eBook content will be loaded dynamically from the server

export default function TTSApp() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [browserVoices, setBrowserVoices] = useState<Voice[]>([]);
  const [allVoices, setAllVoices] = useState<Voice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [words, setWords] = useState<string[]>([]);

  // New feature states
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });
  const [isPodcastMode, setIsPodcastMode] = useState(false);
  const [podcastSegments, setPodcastSegments] = useState<PodcastSegment[]>([]);
  const [selectedPodcastVoices, setSelectedPodcastVoices] = useState<string[]>(
    []
  );
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [showVoiceControls, setShowVoiceControls] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [projectInfo, setProjectInfo] = useState<{
    fileName: string;
    fileSizeFormatted: string;
    exists: boolean;
  } | null>(null);

  // File Explorer states
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [activeContentTab, setActiveContentTab] = useState<"input" | "library">(
    "input"
  );

  // Dynamic eBook content (loaded from data/Ebooks via API)
  const [predefinedEbookContent, setPredefinedEbookContent] = useState<
    FileItem[]
  >([]);

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        const res = await fetch(`/api/ebooks?t=${Date.now()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json?.success) {
          setPredefinedEbookContent(json.data || []);
        } else {
          console.error("Failed to load ebooks from API");
        }
      } catch (err) {
        console.error("Error fetching ebooks:", err);
      }
    };

    fetchEbooks();
  }, []);

  // Mobile states
  const [activeMobileTab, setActiveMobileTab] = useState("home");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const mobileInfo = useMobileEnhanced();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsContainerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Load available voices on component mount
  useEffect(() => {
    // Load profiles from localStorage
    const savedProfiles = localStorage.getItem("voiceProfiles");
    if (savedProfiles) {
      try {
        setVoiceProfiles(JSON.parse(savedProfiles));
      } catch (error) {
        console.error("Failed to load voice profiles:", error);
      }
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("voiceSettings");
    if (savedSettings) {
      try {
        setVoiceSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to load voice settings:", error);
      }
    }

    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const systemVoices = speechSynthesis.getVoices();
        setAvailableVoices(systemVoices);

        // Convert system voices to our Voice interface
        const convertedBrowserVoices: Voice[] = systemVoices.map(
          (voice, index) => {
            // Determine gender from voice name
            const name = voice.name.toLowerCase();
            let gender = "Unknown";

            if (
              name.includes("female") ||
              name.includes("woman") ||
              name.includes("girl") ||
              name.includes("samantha") ||
              name.includes("karen") ||
              name.includes("zira") ||
              name.includes("susan") ||
              name.includes("ava") ||
              name.includes("emma")
            ) {
              gender = "Female";
            } else if (
              name.includes("male") ||
              name.includes("man") ||
              name.includes("boy") ||
              name.includes("alex") ||
              name.includes("david") ||
              name.includes("daniel") ||
              name.includes("james") ||
              name.includes("oliver")
            ) {
              gender = "Male";
            }

            return {
              id: `browser-${index}`,
              name: voice.name,
              language: voice.lang,
              gender,
              source: "browser" as const,
              isDefault: voice.default,
              voiceURI: voice.voiceURI,
            };
          }
        );

        // Filter for English voices and sort by quality
        const englishBrowserVoices = convertedBrowserVoices
          .filter((voice) => voice.language.startsWith("en"))
          .sort((a, b) => {
            const aScore =
              (a.isDefault ? 2 : 0) +
              (a.name.includes("premium") || a.name.includes("enhanced")
                ? 1
                : 0) +
              (a.voiceURI?.includes("local") ? 1 : 0);
            const bScore =
              (b.isDefault ? 2 : 0) +
              (b.name.includes("premium") || b.name.includes("enhanced")
                ? 1
                : 0) +
              (b.voiceURI?.includes("local") ? 1 : 0);
            return bScore - aScore;
          });

        setBrowserVoices(englishBrowserVoices);

        // Combine all voices
        const combinedVoices = [...englishBrowserVoices, ...fallbackVoices];
        setAllVoices(combinedVoices);

        // Set default voice to first available browser voice
        if (combinedVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(combinedVoices[0].id);
        }

        setVoicesLoaded(true);
        console.log(
          `Loaded ${englishBrowserVoices.length} browser voices and ${fallbackVoices.length} online voices`
        );
      };

      // Load voices immediately if available
      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // Wait for voices to be loaded
        speechSynthesis.onvoiceschanged = loadVoices;
      }

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [selectedVoice]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + Space: Play/Pause
      if ((event.ctrlKey || event.metaKey) && event.code === "Space") {
        event.preventDefault();
        if (isPlaying) {
          if (isPaused) {
            resumeSpeech();
          } else {
            pauseSpeech();
          }
        } else {
          generateSpeech();
        }
      }

      // Ctrl/Cmd + S: Stop
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyS") {
        event.preventDefault();
        stopSpeech();
      }

      // Ctrl/Cmd + D: Download
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyD") {
        event.preventDefault();
        if (audioUrl) {
          downloadAudio();
        }
      }

      // Ctrl/Cmd + K: Toggle voice controls
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyK") {
        event.preventDefault();
        setShowVoiceControls(!showVoiceControls);
      }

      // Ctrl/Cmd + P: Toggle podcast mode
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyP") {
        event.preventDefault();
        setIsPodcastMode(!isPodcastMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isPaused, audioUrl, showVoiceControls, isPodcastMode]);

  // Save voice settings to localStorage
  useEffect(() => {
    localStorage.setItem("voiceSettings", JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  // Extract words from text for highlighting
  useEffect(() => {
    if (text) {
      const wordArray = text.match(/\S+/g) || [];
      setWords(wordArray);
    } else {
      setWords([]);
    }
    setCurrentWordIndex(-1);
  }, [text]);

  // Handle speech synthesis events for highlighting
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const handleSpeechEnd = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
        setProgress(100);
      };

      // Not all browsers fire events the same way; this keeps it harmless.
      // @ts-ignore
      speechSynthesis.addEventListener?.("end", handleSpeechEnd);
      return () => {
        // @ts-ignore
        speechSynthesis.removeEventListener?.("end", handleSpeechEnd);
      };
    }
  }, []);

  // Auto-scroll highlighted word into view when currentWordIndex changes
  useEffect(() => {
    if (!wordsContainerRef.current) return;
    if (!isPlaying) return;

    const activeEl = document.getElementById(`word-${currentWordIndex}`);
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [currentWordIndex, isPlaying]);

  // ---------- FILE UPLOAD HELPERS (fixed) ----------
  // Single function that processes a File (used by input onChange and drag/drop)
  const processUploadedFile = async (file: File) => {
    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Focus on text files primarily, with experimental support for other formats
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `File type ${file.type} is not supported. Please upload a text file (.txt) for best results.`,
        variant: "destructive",
      });
      return;
    }

    // Warn users about non-text files
    if (file.type !== "text/plain") {
      toast({
        title: "Experimental file support",
        description:
          "Text files work best. PDF and Word files have limited support and may not extract text correctly.",
        variant: "default",
      });
    }

    setIsProcessing(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log(
        "Uploading file:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Upload response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to process file");
      }

      if (!result.extractedText || result.extractedText.trim().length === 0) {
        throw new Error("No text could be extracted from the file");
      }

      setText(result.extractedText);

      toast({
        title: "File uploaded successfully",
        description: `Extracted ${result.extractedText.length} characters from ${file.name}`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process the file. Please try again.",
        variant: "destructive",
      });
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadedFileName("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Input onChange -> extract File and delegate
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
    // Optional: clear so same file can be re-selected if needed
    event.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Drag/drop -> pass File directly (no fake React event)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processUploadedFile(file);
    }
  };
  // ---------- END FILE UPLOAD HELPERS ----------

  const previewVoice = async () => {
    if (!selectedVoice) return;

    const currentVoice = allVoices.find((v) => v.id === selectedVoice);
    if (!currentVoice) return;

    const previewText = `Hello, this is ${currentVoice.name} speaking. I am a ${currentVoice.gender} voice from ${currentVoice.language}.`;

    try {
      if (
        currentVoice.source === "browser" ||
        currentVoice.source === "local"
      ) {
        await generateBrowserSpeech(previewText, currentVoice);
      } else {
        await generateOnlineSpeech(previewText, currentVoice);
      }
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Could not preview this voice.",
        variant: "destructive",
      });
    }
  };

  // File Explorer Helper Functions
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileSelect = (file: FileItem) => {
    if (file.type === "file") {
      setText(file.content || "");
      toast({
        title: "Content Loaded",
        description: `"${file.name}" loaded to editor`,
      });
    }
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
                variant="ghost"
                size="sm"
                className="h-8 px-2 justify-start flex-1"
                onClick={() => handleFileSelect(item)}
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
              <div className="w-6" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 justify-start flex-1"
                onClick={() => handleFileSelect(item)}
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

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const selectedVoiceObj = allVoices.find((v) => v.id === selectedVoice);

      if (
        selectedVoiceObj?.source === "browser" ||
        selectedVoiceObj?.source === "local"
      ) {
        // Use Web Speech API for browser/local voices
        await generateBrowserSpeech(text, selectedVoiceObj);
      } else {
        // Use online TTS API
        await generateOnlineSpeech(text, selectedVoiceObj);
      }
    } catch (error) {
      toast({
        title: "Speech generation failed",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const generateBrowserSpeech = async (textToSpeak: string, voice: Voice) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      // Wait for voices to be loaded if not already
      if (!voicesLoaded || availableVoices.length === 0) {
        await new Promise((resolve) => {
          const checkVoices = () => {
            if (speechSynthesis.getVoices().length > 0) {
              setAvailableVoices(speechSynthesis.getVoices());
              setVoicesLoaded(true);
              resolve(true);
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          checkVoices();
        });
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      // For browser voices, find the exact matching system voice
      if (voice.source === "browser") {
        const systemVoice = availableVoices.find(
          (sv) => sv.voiceURI === voice.voiceURI
        );
        if (systemVoice) {
          utterance.voice = systemVoice;
          console.log(
            `✅ Using browser voice: ${systemVoice.name} (${systemVoice.lang})`
          );
        } else {
          // Fallback to first available voice with same language
          const fallbackVoice = availableVoices.find(
            (sv) => sv.lang === voice.language
          );
          if (fallbackVoice) {
            utterance.voice = fallbackVoice;
            console.log(`⚠️ Using fallback voice: ${fallbackVoice.name}`);
          }
        }
      } else {
        // Legacy local voice handling
        const currentVoices = speechSynthesis.getVoices();
        console.log(
          "Available system voices:",
          currentVoices.map(
            (v) =>
              `${v.name} (${v.lang}) - ${v.localService ? "Local" : "Remote"}`
          )
        );
        console.log(
          `Looking for voice: ${voice.name} (${voice.gender}, ${voice.language})`
        );

        let matchingVoice: SpeechSynthesisVoice | undefined = undefined;

        // Priority 1: Exact name match
        matchingVoice = currentVoices.find(
          (v) => v.name.toLowerCase() === voice.name.toLowerCase()
        );

        if (!matchingVoice) {
          // Priority 2: Partial name match
          matchingVoice = currentVoices.find(
            (v) =>
              v.name.toLowerCase().includes(voice.name.toLowerCase()) ||
              voice.name.toLowerCase().includes(v.name.toLowerCase())
          );
        }

        if (!matchingVoice) {
          // Priority 3: Language + Gender match with common voice patterns
          const langCode = voice.language.split("-")[0];

          const femaleKeywords = [
            "female",
            "woman",
            "girl",
            "samantha",
            "karen",
            "zira",
            "susan",
            "karen",
          ];
          const maleKeywords = [
            "male",
            "man",
            "boy",
            "alex",
            "david",
            "daniel",
            "james",
            "oliver",
          ];

          matchingVoice = currentVoices.find((v) => {
            const voiceName = v.name.toLowerCase();
            const voiceLang = v.lang.toLowerCase();

            const langMatch = voiceLang.includes(langCode);

            let genderMatch = false;
            if (voice.gender === "Female") {
              genderMatch = femaleKeywords.some((keyword) =>
                voiceName.includes(keyword)
              );
            } else {
              genderMatch = maleKeywords.some((keyword) =>
                voiceName.includes(keyword)
              );
            }

            return langMatch && genderMatch;
          });
        }

        if (!matchingVoice) {
          // Priority 4: Language match only
          const langCode = voice.language.split("-")[0];
          matchingVoice = currentVoices.find((v) =>
            v.lang.toLowerCase().includes(langCode)
          );
        }

        if (!matchingVoice) {
          // Priority 5: Any English voice
          matchingVoice = currentVoices.find((v) =>
            v.lang.toLowerCase().includes("en")
          );
        }

        if (!matchingVoice) {
          // Priority 6: First available voice
          matchingVoice = currentVoices[0];
        }

        if (matchingVoice) {
          utterance.voice = matchingVoice;
          console.log(
            `✅ Using voice: ${matchingVoice.name} (${matchingVoice.lang}) for ${voice.name} (${voice.gender})`
          );
        } else {
          console.warn("❌ No matching voice found, using default");
        }
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setProgress(10);
      };

      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        const progressPercent = Math.min(
          (event.charIndex / textToSpeak.length) * 100,
          90
        );
        setProgress(progressPercent);

        // Update current word for highlighting
        // Not all browsers provide "word" name; we gracefully ignore if absent
        if ((event as any).name === "word") {
          const textBefore = textToSpeak.substring(0, event.charIndex);
          const wordCount = (textBefore.match(/\S+/g) || []).length;
          setCurrentWordIndex(wordCount);
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
        setProgress(100);
        utteranceRef.current = null;
        toast({
          title: "Speech completed",
          description: `Text read using ${voice.name}.`,
        });
      };

      utterance.onerror = (event: any) => {
        setIsPlaying(false);
        setProgress(0);
        console.error("Speech synthesis error:", event);
        throw new Error(`Speech synthesis failed: ${event.error}`);
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      throw new Error("Speech synthesis is not supported in your browser");
    }
  };

  const generateOnlineSpeech = async (textToSpeak: string, voice?: Voice) => {
    console.log(
      `Generating online speech for ${voice?.name ?? "unknown voice"}`
    );

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textToSpeak,
        voiceId: voice?.id ?? "online-1",
        voiceName: voice?.name ?? "Online Voice",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate speech");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setProgress(100);

    toast({
      title: "Speech generated successfully",
      description: `Audio generated${
        voice ? ` using ${voice.name}` : ""
      }. Click play to listen.`,
    });
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    setProgress(0);
  };

  const pauseSpeech = () => {
    if ("speechSynthesis" in window && isPlaying && !isPaused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeech = () => {
    if ("speechSynthesis" in window && isPlaying && isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const togglePauseResume = () => {
    if (isPaused) {
      resumeSpeech();
    } else {
      pauseSpeech();
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const clearAll = () => {
    stopSpeech();
    setText("");
    setAudioUrl(null);
    setUploadedFileName("");
    setProgress(0);
    setCurrentWordIndex(-1);
    setIsPaused(false);
    setWords([]);
    setPodcastSegments([]);
    setCurrentSegmentIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Cleared",
      description: "All content has been cleared.",
    });
  };

  // Voice Profile Functions
  const saveVoiceProfile = () => {
    const currentVoice = allVoices.find((v) => v.id === selectedVoice);
    if (!currentVoice) return;

    const newProfile: VoiceProfile = {
      id: `profile-${Date.now()}`,
      name: `${currentVoice.name} Profile`,
      settings: { ...voiceSettings },
      voiceId: selectedVoice,
      createdAt: new Date(),
    };

    const updatedProfiles = [...voiceProfiles, newProfile];
    setVoiceProfiles(updatedProfiles);
    localStorage.setItem("voiceProfiles", JSON.stringify(updatedProfiles));

    toast({
      title: "Profile saved",
      description: `Voice profile for ${currentVoice.name} has been saved.`,
    });
  };

  const loadVoiceProfile = (profile: VoiceProfile) => {
    setSelectedVoice(profile.voiceId);
    setVoiceSettings(profile.settings);
    toast({
      title: "Profile loaded",
      description: `Loaded ${profile.name}`,
    });
  };

  const deleteVoiceProfile = (profileId: string) => {
    const updatedProfiles = voiceProfiles.filter((p) => p.id !== profileId);
    setVoiceProfiles(updatedProfiles);
    localStorage.setItem("voiceProfiles", JSON.stringify(updatedProfiles));
    toast({
      title: "Profile deleted",
      description: "Voice profile has been removed.",
    });
  };

  // Podcast Mode Functions
  const addPodcastSegment = () => {
    if (!text.trim()) return;

    const currentVoice = allVoices.find((v) => v.id === selectedVoice);
    if (!currentVoice) return;

    const newSegment: PodcastSegment = {
      id: `segment-${Date.now()}`,
      voiceId: selectedVoice,
      text: text.trim(),
      voice: currentVoice,
    };

    setPodcastSegments([...podcastSegments, newSegment]);
    setText("");
    toast({
      title: "Segment added",
      description: `Added segment with ${currentVoice.name}`,
    });
  };

  const removePodcastSegment = (segmentId: string) => {
    setPodcastSegments(podcastSegments.filter((s) => s.id !== segmentId));
  };

  const playPodcast = async () => {
    if (podcastSegments.length === 0) {
      toast({
        title: "No segments",
        description: "Add some segments to create a podcast.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentSegmentIndex(0);

    try {
      for (let i = 0; i < podcastSegments.length; i++) {
        const segment = podcastSegments[i];
        setCurrentSegmentIndex(i);

        const segmentVoice = allVoices.find((v) => v.id === segment.voiceId);
        if (segmentVoice) {
          if (
            segmentVoice.source === "browser" ||
            segmentVoice.source === "local"
          ) {
            await generateBrowserSpeech(segment.text, segmentVoice);
          } else {
            await generateOnlineSpeech(segment.text, segmentVoice);
          }
        }

        // Small pause between segments
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      toast({
        title: "Podcast playback failed",
        description: "Failed to play podcast segments.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentSegmentIndex(0);
    }
  };

  // Enhanced Download / Share (WAV to match API)
  const downloadVoiceSettings = () => {
    const settingsData = {
      voiceSettings,
      selectedVoice,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Settings downloaded",
      description: "Voice settings have been exported.",
    });
  };

  const uploadVoiceSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settingsData = JSON.parse(e.target?.result as string);
        if (settingsData.voiceSettings) {
          setVoiceSettings(settingsData.voiceSettings);
        }
        if (settingsData.selectedVoice) {
          setSelectedVoice(settingsData.selectedVoice);
        }
        toast({
          title: "Settings imported",
          description: "Voice settings have been loaded.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid settings file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const shareAudio = async () => {
    if (!audioUrl) return;

    if (navigator.share && mobileInfo.isMobile) {
      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        // WAV to match API response
        const file = new File([blob], "tts-audio.wav", { type: "audio/wav" });

        await navigator.share({
          title: "Voice Studio Audio",
          text: "Check out this audio I created!",
          files: [file],
        });
      } catch (error) {
        console.error("Share failed:", error);
        downloadAudio();
      }
    } else {
      downloadAudio();
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = `tts-audio-${Date.now()}.wav`; // WAV to match API response
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Optional: project download stub so JSX handler exists
  const downloadProject = () => {
    toast({
      title: "Not available",
      description: "Project archive is not available yet.",
    });
  };

  const currentVoice = allVoices.find((v) => v.id === selectedVoice);

  // Mobile UI
  if (mobileInfo.isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* App Bar */}
        <AppBar
          title={showVoiceSelector ? "Select Voice" : "Voice Studio"}
          showBackButton={showVoiceSelector}
          onBackClick={() => setShowVoiceSelector(false)}
          actions={
            activeMobileTab === "home" &&
            !showVoiceSelector && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceControls(!showVoiceControls)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )
          }
        />

        {/* Main Content */}
        <div className="pt-14">
          {showVoiceSelector ? (
            <MobileVoiceSelector
              voices={allVoices}
              selectedVoice={selectedVoice}
              onVoiceSelect={setSelectedVoice}
              onPreview={(voiceId) => {
                const voice = allVoices.find((v) => v.id === voiceId);
                if (voice) {
                  previewVoice();
                }
              }}
              onClose={() => setShowVoiceSelector(false)}
            />
          ) : (
            <>
              {activeMobileTab === "home" && (
                <MobileHome
                  text={text}
                  setText={setText}
                  selectedVoice={selectedVoice}
                  onVoiceSelect={() => setShowVoiceSelector(true)}
                  isPlaying={isPlaying}
                  isProcessing={isProcessing}
                  onPlay={generateSpeech}
                  onStop={stopSpeech}
                  onUpload={() => fileInputRef.current?.click()}
                  audioUrl={audioUrl ?? undefined}
                  progress={progress}
                  currentVoiceName={currentVoice?.name}
                  expandedFolders={expandedFolders}
                  onToggleFolder={(id: string) => {
                    const newExpanded = new Set(expandedFolders);
                    if (newExpanded.has(id)) {
                      newExpanded.delete(id);
                    } else {
                      newExpanded.add(id);
                    }
                    setExpandedFolders(newExpanded);
                  }}
                  onSelectFile={(content: string) => {
                    setText(content);
                    toast({
                      title: "Content Loaded",
                      description: "eBook content loaded to editor",
                    });
                  }}
                />
              )}

              {activeMobileTab === "voice" && (
                <MobileVoiceSelector
                  voices={allVoices}
                  selectedVoice={selectedVoice}
                  onVoiceSelect={setSelectedVoice}
                  onPreview={previewVoice}
                  onClose={() => setActiveMobileTab("home")}
                />
              )}

              {activeMobileTab === "downloads" && (
                <MobileDownloads
                  audioUrl={audioUrl ?? undefined}
                  onDownloadAudio={downloadAudio}
                  onShareAudio={shareAudio}
                />
              )}

              {activeMobileTab === "settings" && (
                <MobileSettings
                  voiceSettings={voiceSettings}
                  onVoiceSettingsChange={setVoiceSettings}
                  onExportSettings={downloadVoiceSettings}
                  onImportSettings={() => fileInputRef.current?.click()}
                  onClearAll={clearAll}
                  isMobile={mobileInfo.isMobile}
                />
              )}
            </>
          )}
        </div>

        {/* FAB for quick actions */}
        {activeMobileTab === "home" && !showVoiceSelector && text && (
          <Fab
            onClick={generateSpeech}
            icon={<Play className="h-6 w-6" />}
            label="Generate Speech"
            variant="primary"
          />
        )}

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeMobileTab}
          onTabChange={setActiveMobileTab}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.doc,.docx,.json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    );
  }

  // Desktop UI (original)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8 pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
                <Headphones className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Voice Studio
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your text into natural-sounding speech with advanced AI
            voices
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 hover:bg-purple-200"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Badge
              variant="secondary"
              className="bg-pink-100 text-pink-800 hover:bg-pink-200"
            >
              <Zap className="h-3 w-3 mr-1" />
              Instant Generation
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              <Mic className="h-3 w-3 mr-1" />
              Multiple Voices
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  Upload Document
                </CardTitle>
                <CardDescription>
                  Drag and drop or click to upload your file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragging
                          ? "Drop your file here"
                          : "Drag & drop your file here"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse
                      </p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="bg-white hover:bg-gray-50"
                      disabled={isProcessing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="font-medium text-green-600">
                        ✓ Text files (.txt) - Fully supported
                      </div>
                      <div className="text-orange-600">
                        ⚠ PDF/Word files - Limited support
                      </div>
                      <div>Max file size: 10MB</div>
                    </div>
                  </div>
                </div>
                {uploadedFileName && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {uploadedFileName}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Text Input & Content Library Card with Tabs */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Content & Editor
                </CardTitle>
                <CardDescription>
                  Enter text, upload files, or browse predefined eBooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeContentTab}
                  onValueChange={(value) =>
                    setActiveContentTab(value as "input" | "library")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="input"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Direct Input
                    </TabsTrigger>
                    <TabsTrigger
                      value="library"
                      className="flex items-center gap-2"
                    >
                      <Book className="h-4 w-4" />
                      eBook Library
                    </TabsTrigger>
                  </TabsList>

                  {/* Direct Input Tab */}
                  <TabsContent value="input" className="space-y-4 mt-4">
                    {/* Highlighted Text Display */}
                    {isPlaying && words.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Volume2 className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">
                            {isPaused ? "Paused" : "Speaking"}...
                          </span>
                        </div>
                        <div
                          ref={wordsContainerRef}
                          className="text-sm leading-relaxed max-h-32 overflow-y-auto"
                        >
                          {words.map((word, index) => (
                            <span
                              id={`word-${index}`}
                              key={index}
                              className={`transition-all duration-200 ${
                                index === currentWordIndex
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1 rounded font-semibold"
                                  : index < currentWordIndex
                                  ? "text-gray-500"
                                  : "text-gray-800"
                              }`}
                            >
                              {word}{" "}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Textarea
                      placeholder="Enter your text here, or upload a file above..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[200px] resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isProcessing}
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{text.length} characters</span>
                      <span>~{Math.ceil(text.length / 5)} words</span>
                    </div>
                  </TabsContent>

                  {/* eBook Library Tab */}
                  <TabsContent value="library" className="space-y-4 mt-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <p className="text-sm text-gray-600 mb-3">
                        📚 Select an eBook and episode to load its content into
                        the editor
                      </p>
                      {predefinedEbookContent.length > 0 ? (
                        predefinedEbookContent.map((item) =>
                          renderTreeItem(item)
                        )
                      ) : (
                        <p className="text-sm text-gray-500">
                          No eBooks available
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Voice Selection & Controls */}
          <div className="space-y-6">
            {/* Voice Selection Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  Voice Selection
                </CardTitle>
                <CardDescription>Choose your preferred voice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Select Voice</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedVoice}
                      onValueChange={setSelectedVoice}
                      disabled={isProcessing}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choose a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="max-h-80 overflow-y-auto">
                          {allVoices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="truncate max-w-[150px]">
                                    {voice.name}
                                  </span>
                                  {voice.isDefault && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className="text-xs text-muted-foreground">
                                    {voice.language}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      voice.source === "browser"
                                        ? "bg-purple-100 text-purple-800"
                                        : voice.source === "local"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {voice.source}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={previewVoice}
                      variant="outline"
                      size="icon"
                      disabled={isProcessing || isPlaying}
                      title="Preview voice"
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Voice Details</Label>
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-sm">
                    {currentVoice && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Name:</span>
                          <span>{currentVoice.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Language:</span>
                          <span>{currentVoice.language}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Gender:</span>
                          <span>{currentVoice.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Source:</span>
                          <Badge
                            variant={
                              currentVoice.source === "browser"
                                ? "default"
                                : currentVoice.source === "local"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {currentVoice.source}
                          </Badge>
                        </div>
                        {currentVoice.isDefault && (
                          <div className="flex justify-between">
                            <span className="font-medium">Default:</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Yes
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Voice Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Voice Controls
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVoiceControls(!showVoiceControls)}
                      className="h-8 px-2"
                    >
                      <Sliders className="h-4 w-4 mr-1" />
                      {showVoiceControls ? "Hide" : "Show"}
                    </Button>
                  </div>

                  {showVoiceControls && (
                    <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      {/* Rate Control */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Rate</Label>
                          <span className="text-xs text-muted-foreground">
                            {voiceSettings.rate.toFixed(1)}x
                          </span>
                        </div>
                        <Slider
                          value={[voiceSettings.rate]}
                          onValueChange={(value) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              rate: value[0],
                            }))
                          }
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Pitch Control */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Pitch</Label>
                          <span className="text-xs text-muted-foreground">
                            {voiceSettings.pitch.toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[voiceSettings.pitch]}
                          onValueChange={(value) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              pitch: value[0],
                            }))
                          }
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Volume Control */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Volume</Label>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(voiceSettings.volume * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[voiceSettings.volume]}
                          onValueChange={(value) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              volume: value[0],
                            }))
                          }
                          min={0}
                          max={1.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Preset Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setVoiceSettings({
                              rate: 0.8,
                              pitch: 0.9,
                              volume: 1.0,
                            })
                          }
                          className="text-xs"
                        >
                          Slow
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setVoiceSettings({
                              rate: 1.0,
                              pitch: 1.0,
                              volume: 1.0,
                            })
                          }
                          className="text-xs"
                        >
                          Normal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setVoiceSettings({
                              rate: 1.2,
                              pitch: 1.1,
                              volume: 1.0,
                            })
                          }
                          className="text-xs"
                        >
                          Fast
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveVoiceProfile}
                          className="text-xs"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice Profiles */}
                {voiceProfiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Voice Profiles
                    </Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {voiceProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {profile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Rate: {profile.settings.rate.toFixed(1)} | Pitch:{" "}
                              {profile.settings.pitch.toFixed(1)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadVoiceProfile(profile)}
                              className="h-8 w-8 p-0"
                            >
                              <User className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteVoiceProfile(profile.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Podcast Mode Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Podcast Mode</Label>
                    <Switch
                      checked={isPodcastMode}
                      onCheckedChange={setIsPodcastMode}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create multi-voice audio content with different voices for
                    different segments
                  </p>
                </div>

                {/* Voice Info */}
                {voicesLoaded &&
                  (browserVoices.length > 0 || availableVoices.length > 0) && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Available Voices ({browserVoices.length} browser +{" "}
                        {fallbackVoices.length} online)
                      </Label>
                      <div className="p-2 bg-gray-50 rounded-md text-xs max-h-24 overflow-y-auto">
                        {browserVoices.slice(0, 2).map((voice, index) => (
                          <div
                            key={index}
                            className="text-muted-foreground flex items-center gap-1"
                          >
                            <span>{voice.name}</span>
                            <span className="text-gray-400">
                              ({voice.language})
                            </span>
                            {voice.isDefault && (
                              <span className="text-yellow-600">⭐</span>
                            )}
                            <span className="text-purple-600 bg-purple-50 px-1 rounded">
                              Browser
                            </span>
                          </div>
                        ))}
                        {browserVoices.length > 2 && (
                          <div className="text-muted-foreground italic">
                            ... and {browserVoices.length - 2} more browser
                            voices
                          </div>
                        )}
                        {fallbackVoices.length > 0 &&
                          browserVoices.length > 0 && (
                            <div className="border-t my-1"></div>
                          )}
                        {fallbackVoices.slice(0, 1).map((voice, index) => (
                          <div
                            key={index}
                            className="text-muted-foreground flex items-center gap-1"
                          >
                            <span>{voice.name}</span>
                            <span className="text-gray-400">
                              ({voice.language})
                            </span>
                            <span className="text-green-600 bg-green-50 px-1 rounded">
                              Online
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Podcast Mode Section */}
            {isPodcastMode && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-purple-600" />
                    Podcast Studio
                  </CardTitle>
                  <CardDescription>
                    Create multi-voice content by adding segments with different
                    voices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Segment Section */}
                  <div className="space-y-2">
                    <Label>Add Segment</Label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Enter text for this segment..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[80px] resize-none"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={selectedVoice}
                        onValueChange={setSelectedVoice}
                        disabled={isProcessing}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose voice for this segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="max-h-40 overflow-y-auto">
                            {allVoices.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate max-w-[120px]">
                                    {voice.name}
                                  </span>
                                  <span
                                    className={`text-xs px-1 py-0.5 rounded ${
                                      voice.source === "browser"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {voice.source}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={addPodcastSegment}
                        disabled={isProcessing || !text.trim()}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Segments List */}
                  {podcastSegments.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Segments ({podcastSegments.length})</Label>
                        <Button
                          onClick={playPodcast}
                          disabled={isProcessing}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Radio className="h-4 w-4 mr-1" />
                          Play Podcast
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {podcastSegments.map((segment, index) => (
                          <div
                            key={segment.id}
                            className={`p-3 rounded-lg border transition-all ${
                              currentSegmentIndex === index
                                ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-purple-600">
                                    Segment {index + 1}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {segment.voice.name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {segment.text}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePodcastSegment(segment.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-4">
                <Button
                  onClick={generateSpeech}
                  disabled={isProcessing || (!text.trim() && !isPodcastMode)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isPodcastMode ? (
                    <>
                      <Radio className="h-4 w-4 mr-2" />
                      {podcastSegments.length > 0
                        ? "Play Podcast"
                        : "Add Segments"}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Speech
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  {(isPlaying || audioUrl) && (
                    <Button
                      onClick={stopSpeech}
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}

                  {isPlaying &&
                    (currentVoice?.source === "browser" ||
                      currentVoice?.source === "local") && (
                      <Button
                        onClick={togglePauseResume}
                        variant="outline"
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isPaused ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        )}
                      </Button>
                    )}

                  {audioUrl && (
                    <Button
                      onClick={mobileInfo.isMobile ? shareAudio : downloadAudio}
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {mobileInfo.isMobile ? (
                        <>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={downloadVoiceSettings}
                    variant="outline"
                    disabled={isProcessing}
                    className="w-full"
                    title="Export voice settings"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Export
                  </Button>

                  <Button
                    onClick={downloadProject}
                    variant="outline"
                    disabled={isProcessing || !projectInfo?.exists}
                    className="w-full"
                    title={
                      projectInfo?.exists
                        ? `Download complete project (${projectInfo.fileSizeFormatted})`
                        : "Project archive not available"
                    }
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    {projectInfo?.exists
                      ? `Project (${projectInfo.fileSizeFormatted})`
                      : "Project"}
                  </Button>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={uploadVoiceSettings}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Import voice settings"
                  />
                  <Button
                    variant="outline"
                    disabled={isProcessing}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                </div>

                {(text ||
                  audioUrl ||
                  uploadedFileName ||
                  podcastSegments.length > 0) && (
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    disabled={isProcessing}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}

                {/* Mobile Indicator */}
                {mobileInfo.isMobile && (
                  <div className="flex items-center justify-center p-2 bg-blue-50 rounded-lg">
                    <Smartphone className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-xs text-blue-800">
                      Mobile mode enabled
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <Card className="mt-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <Card className="mt-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full">
                    <Volume2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                    controls
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4">
                <Volume2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Natural Voices</h3>
              <p className="text-sm text-gray-600">
                Choose from various natural-sounding voices with different
                accents and genders
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">File Support</h3>
              <p className="text-sm text-gray-600">
                Upload PDF, DOC, or TXT files and automatically extract text
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Download Audio</h3>
              <p className="text-sm text-gray-600">
                Save your generated speech as high-quality MP3 files
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcuts Help */}
        <Card className="mt-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Keyboard Shortcuts
            </CardTitle>
            <CardDescription>
              Quick shortcuts to enhance your productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    Ctrl
                  </kbd>
                  <span className="text-gray-500">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    Space
                  </kbd>
                </div>
                <span className="text-sm text-gray-700">Play/Pause</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    Ctrl
                  </kbd>
                  <span className="text-gray-500">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    S
                  </kbd>
                </div>
                <span className="text-sm text-gray-700">Stop</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    Ctrl
                  </kbd>
                  <span className="text-gray-500">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    D
                  </kbd>
                </div>
                <span className="text-sm text-gray-700">Download</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    Ctrl
                  </kbd>
                  <span className="text-gray-500">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    K
                  </kbd>
                </div>
                <span className="text-sm text-gray-700">Voice Controls</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    Ctrl
                  </kbd>
                  <span className="text-gray-500">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                    P
                  </kbd>
                </div>
                <span className="text-sm text-gray-700">Podcast Mode</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
