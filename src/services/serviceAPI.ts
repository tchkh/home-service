import axios from 'axios';
import { Service } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/services/getServices`);
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/admin/services/deleteServiceById?serviceId=${id}`);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};
