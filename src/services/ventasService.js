import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

console.log('🔗 API URL configurada:', API_URL);

const ventasService = {
  // 📦 Obtener todas las ventas
  getAll: async (params = {}) => {
    try {
      console.log('📦 Obteniendo todas las ventas...');
      const response = await axios.get(`${API_URL}/ventas`, { params });
      console.log(`✅ Se obtuvieron ${response.data.length} ventas`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener ventas:', error);
      throw error;
    }
  },

  // 🔍 Obtener una venta por ID
  getById: async (id) => {
    try {
      console.log(`🔍 Obteniendo venta con ID: ${id}`);
      const response = await axios.get(`${API_URL}/ventas/${id}`);
      console.log(`✅ Venta obtenida:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener venta:', error);
      throw error;
    }
  },

  // ➕ Crear nueva venta
  create: async (venta) => {
    try {
      console.log('➕ Creando nueva venta...');
      const response = await axios.post(`${API_URL}/ventas`, venta);
      console.log('✅ Venta creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear venta:', error);
      throw error;
    }
  },

  // 📊 Obtener estadísticas
  getStats: async () => {
    try {
      console.log('📊 Obteniendo estadísticas de ventas...');
      const response = await axios.get(`${API_URL}/ventas/stats/resumen`);
      console.log('✅ Estadísticas obtenidas');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }
};

export default ventasService;