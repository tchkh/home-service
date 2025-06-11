import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";

type ProfileDialogsProps = {
  showUploadConfirm: boolean;
  setShowUploadConfirm: (open: boolean) => void;
  previewUrl: string | null;
  handleUploadCancel: () => void;
  handleUploadConfirm: () => void;
  isUploading: boolean;
  showDeleteAlert: boolean;
  setShowDeleteAlert: (open: boolean) => void;
  handleDeleteConfirm: () => void;
  isDeleting: boolean;
};

export default function ProfileDialogs({
    showUploadConfirm,
  setShowUploadConfirm,
  previewUrl,
  handleUploadCancel,
  handleUploadConfirm,
  isUploading,
  showDeleteAlert,
  setShowDeleteAlert,
  handleDeleteConfirm,
  isDeleting,
}: ProfileDialogsProps ) {
  return (
    <>
      {/* Upload Confirmation Dialog */}
      <AlertDialog open={showUploadConfirm} onOpenChange={setShowUploadConfirm}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              ยืนยันการอัพโหลดรูปโปรไฟล์?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex justify-center py-4">
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden object-cover"
                />
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleUploadCancel}
              disabled={isUploading}
              className="cursor-pointer btn btn--secondary"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUploadConfirm}
              disabled={isUploading}
              className="cursor-pointer btn btn--primary"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              อัพโหลด
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              ต้องการลบรูปโปรไฟล์นี้ใช่หรือไม่?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              การกระทำนี้ไม่สามารถยกเลิกได้
              และรูปโปรไฟล์ของคุณจะถูกลบออกอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowDeleteAlert(false)}
              disabled={isDeleting}
              className="btn btn--primary"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="btn btn--secondary"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
