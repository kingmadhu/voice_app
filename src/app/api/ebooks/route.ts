import { promises as fs } from "fs";
import path from "path";

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
}

async function readEbooksDirectory(): Promise<FileItem[]> {
  const ebooksPath = path.join(process.cwd(), "data", "Ebooks");

  try {
    // Get all directories in Ebooks folder
    const entries = await fs.readdir(ebooksPath, { withFileTypes: true });

    const items: FileItem[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folderPath = path.join(ebooksPath, entry.name);
        const files = await fs.readdir(folderPath, { withFileTypes: true });

        const children: FileItem[] = [];

        for (const file of files) {
          if (file.isFile() && file.name.endsWith(".txt")) {
            const filePath = path.join(folderPath, file.name);
            const content = await fs.readFile(filePath, "utf-8");

            children.push({
              id: `${entry.name}-${file.name}`,
              name: file.name.replace(".txt", ""),
              type: "file",
              content: content,
            });
          }
        }

        // Sort files alphabetically
        children.sort((a, b) => a.name.localeCompare(b.name));

        items.push({
          id: entry.name,
          name: entry.name,
          type: "folder",
          children: children,
        });
      }
    }

    // Sort folders alphabetically
    items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  } catch (error) {
    console.error("Error reading ebooks directory:", error);
    return [];
  }
}

export async function GET() {
  try {
    const ebooks = await readEbooksDirectory();
    
    // Return response with no-cache headers to prevent caching
    return new Response(JSON.stringify({ success: true, data: ebooks }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to read ebooks" }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
