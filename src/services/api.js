import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// CRUD operations for each entity
// ================= CUSTOMERS =================
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.patch(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.patch(`/customers/${id}/eliminar`);
export const restoreCustomer = (id) => api.patch(`/customers/${id}/restaurar`);

export const getProducts = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status !== undefined) queryParams.append('status', params.status);
  const queryString = queryParams.toString();
  return api.get(`/products${queryString ? '?' + queryString : ''}`);
};
export const getProductsActivos = () => api.get('/products/activos');
export const getProductsInactivos = () => api.get('/products/inactivos');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.patch(`/products/${id}/eliminar`);
export const restoreProduct = (id) => api.patch(`/products/${id}/restaurar`);

export const getTableSpots = () => api.get('/tables'); // Changed from table-spots
export const createTableSpot = (data) => api.post('/tables', data);
export const updateTableSpot = (id, data) => api.put(`/tables/${id}`, data);
export const deleteTableSpot = (id) => api.delete(`/tables/${id}`);

export const getReservations = () => api.get('/reservations');
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservation = (id, data) => api.put(`/reservations/${id}`, data);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);

// ================= ORDERS =================
export const getOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.patch(`/orders/${id}/eliminar`);

// ================= ORDER DETAILS =================
export const getOrderDetails = () => api.get('/order-details');
export const createOrderDetail = (data) => api.post('/order-details', data);
export const updateOrderDetail = (id, data) => api.put(`/order-details/${id}`, data);
export const deleteOrderDetail = (id) => api.patch(`/order-details/${id}/eliminar`);

export default api;
