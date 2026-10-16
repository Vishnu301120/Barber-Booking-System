import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// =====================================
// AUTH APIs
// =====================================

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const loginUser = (loginData) => {
  return api.post("/auth/login", loginData);
};


// =====================================
// SERVICE APIs
// =====================================

export const getServices = () => {
  return api.get("/services");
};


// =====================================
// BARBER APIs
// =====================================

export const getBarbers = () => {
  return api.get("/barbers");
};


// =====================================
// BOOKING APIs
// =====================================

export const createBooking = (bookingData, token) => {
  return api.post(
    "/bookings",
    bookingData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getMyBookings = (token) => {
  return api.get(
    "/bookings/my",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAllBookings = (token) => {
  return api.get(
    "/bookings",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateBookingStatus = (id, status, token) => {
  return api.put(
    `/bookings/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteBooking = (id, token) => {
  return api.delete(
    `/bookings/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


// =====================================
// USER APIs
// =====================================

export const getProfile = (token) => {
  return api.get(
    "/users/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


// =====================================
// ADMIN APIs
// =====================================

export const getAdminStats = (token) => {
  return api.get(
    "/admin/stats",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAllUsers = (token) => {
  return api.get(
    "/admin/users",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const createService = (serviceData, token) => {
  return api.post(
    "/services",
    serviceData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateService = (id, serviceData, token) => {
  return api.put(
    `/services/${id}`,
    serviceData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteService = (id, token) => {
  return api.delete(
    `/services/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const createBarber = (barberData, token) => {
  return api.post(
    "/barbers",
    barberData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateBarber = (id, barberData, token) => {
  return api.put(
    `/barbers/${id}`,
    barberData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteBarber = (id, token) => {
  return api.delete(
    `/barbers/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export default api;