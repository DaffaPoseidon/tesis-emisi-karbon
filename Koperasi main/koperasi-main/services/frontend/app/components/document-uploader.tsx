import { File, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "~/components/extensions/file-upload";

interface DocumentUploaderProps {
  id: string;
  maxFiles?: number;
  files: (File | string)[] | null | undefined;
  setFiles: (files: (File | string)[] | null) => void;
  defaultFileUrl?: string;
}

export default function DocumentUploader({
  id,
  maxFiles = 1,
  files,
  setFiles,
  defaultFileUrl,
}: DocumentUploaderProps) {
  const [displayFiles, setDisplayFiles] = useState<(File | string)[]>([]);

  useEffect(() => {
    if (defaultFileUrl && (!files || files.length === 0)) {
      setFiles([defaultFileUrl]);
    }
  }, [defaultFileUrl, files, setFiles]);

  useEffect(() => {
    setDisplayFiles(files || []);
  }, [files]);

  const dropZoneConfig = {
    maxFiles: maxFiles,
    maxSize: 1024 * 1024 * 4,
    multiple: maxFiles > 1,
  };

  const handleValueChange = (newFiles: File[] | null) => {
    if (newFiles) {
      setFiles(newFiles);
    } else {
      setFiles(null);
    }
  };

  return (
    <FileUploader
      id={id}
      value={files as File[] | null | undefined}
      onValueChange={handleValueChange}
      dropzoneOptions={dropZoneConfig}
      className="relative rounded-md border-2 border-primary border-dashed bg-[#F1FFF9] p-2"
    >
      {displayFiles.length === 0 && (
        <FileInput className="outline-dashed outline-1 outline-white">
          <div className="flex w-full justify-center gap-2 pt-3 pb-4 ">
            <File className="size-10 text-primary" />
            <div className="space-y-1">
              <p className="mb-1 text-gray-900 text-sm dark:text-gray-400">
                <span className="font-semibold">
                  Tarik file di sini atau klik untuk mengunggah.
                </span>
              </p>
              <p className="text-primary text-xs">Unggah hingga {maxFiles} file.</p>
            </div>
          </div>
        </FileInput>
      )}
      <FileUploaderContent>
        {displayFiles.map((file, i) => (
          <FileUploaderItem
            aria-roledescription={`file ${i + 1} containing ${typeof file === "string" ? file : file.name}`}
            key={i}
            index={i}
          >
            <Paperclip className="h-4 w-4 stroke-current" />
            <span>{typeof file === "string" ? file.split("/").pop() : file.name}</span>
          </FileUploaderItem>
        ))}
      </FileUploaderContent>
    </FileUploader>
  );
}
