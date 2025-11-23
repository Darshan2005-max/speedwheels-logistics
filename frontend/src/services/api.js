import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const getEstimate = async (modelId, pickup, drop) => {
  try {
    const response = await axios.post(`${API_URL}/estimate`, { modelId, pickup, drop });
    return response.data;
  } catch (error) {
    console.error("Error fetching estimate:", error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}/booking`, bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const getBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/booking`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};
