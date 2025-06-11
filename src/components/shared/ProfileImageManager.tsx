import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Camera,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";

type ProfileData = {
  image_url?: string;
  first_name?: string;
  last_name?: string;
};

type ProfileImageManagerProps = {
  profileData: ProfileData;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isUploading: boolean;
  isDeleting: boolean;
  handleUploadClick: () => void;
  handleDeleteImage: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function ProfileImageManager({
  profileData,
  isDialogOpen,
  setIsDialogOpen,
  isUploading,
  isDeleting,
  handleUploadClick,
  handleDeleteImage,
  handleFileChange,
  fileInputRef,
}: ProfileImageManagerProps) {
  return (
    <>
      <div className="flex flex-col items-center space-y-10">
        <div className="relative ">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
            {profileData?.image_url ? (
              <Image
                src={profileData?.image_url}
                alt="Profile"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl text-gray-600 text-center">
                {profileData?.first_name?.charAt(0)}
                {profileData?.last_name?.charAt(0)}
              </span>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--gray-200)] active:bg-[var(--gray-400)] transition-colors cursor-pointer">
                <Camera className="w-5 h-5 text-gray-600 " />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-center">
                  จัดการรูปโปรไฟล์
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Button
                  onClick={handleUploadClick}
                  className="flex items-center justify-center gap-2 w-full btn btn--primary"
                  variant="outline"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  อัพโหลดรูป
                </Button>

                <Button
                  onClick={handleDeleteImage}
                  className="flex items-center justify-center gap-2 w-full btn btn--secondary"
                  variant="outline"
                  disabled={!profileData?.image_url || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  ลบรูป
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </>
  );
}
