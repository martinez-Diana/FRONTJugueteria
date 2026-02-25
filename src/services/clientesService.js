import axios from 'axios';

// URL de tu backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

console.log('🔗 API URL configurada:', API_URL);

const clientesService = {
  // 📦 Obtener todos los clientes
  getAll: async (params = {}) => {
    try {
      console.log('📦 Obteniendo todos los clientes...');
      const response = await axios.get(`${API_URL}/clientes`, { params });
      console.log(`✅ Se obtuvieron ${response.data.length} clientes`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener clientes:', error);
      throw error;
    }
  },

  // 🔍 Obtener un cliente por ID
  getById: async (id) => {
    try {
      console.log(`🔍 Obteniendo cliente con ID: ${id}`);
      const response = await axios.get(`${API_URL}/clientes/${id}`);
      console.log(`✅ Cliente obtenido:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener cliente:', error);
      throw error;
    }
  },

  // 🔄 Actualizar un cliente
  update: async (id, cliente) => {
    try {
      console.log(`🔄 Actualizando cliente ID: ${id}`);
      const response = await axios.put(`${API_URL}/clientes/${id}`, cliente);
      console.log('✅ Cliente actualizado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar cliente:', error);
      throw error;
    }
  },

  // 🗑️ Eliminar un cliente
  delete: async (id) => {
    try {
      console.log(`🗑️ Eliminando cliente ID: ${id}`);
      const response = await axios.delete(`${API_URL}/clientes/${id}`);
      console.log('✅ Cliente eliminado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      throw error;
    }
  },

  // 📊 Obtener estadísticas
  getStats: async () => {
    try {
      console.log('📊 Obteniendo estadísticas de clientes...');
      const response = await axios.get(`${API_URL}/clientes/stats/resumen`);
      console.log('✅ Estadísticas obtenidas');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }
};

export default clientesService;