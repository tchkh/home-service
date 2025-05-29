import { useState } from "react"; // นำเข้า useCallback
import axios from "axios";

export const useTechnicianJobs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptJob = async (serviceRequestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/technician/accept-job', { serviceRequestId });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error || "Failed to accept job" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการรับงาน";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const rejectJob = async (serviceRequestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/technician/reject-job', { serviceRequestId });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error || "Failed to reject job" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการรับงาน";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    loading,
    error,
    acceptJob,
    rejectJob,
  };
};