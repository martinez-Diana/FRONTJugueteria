import axios from 'axios';

// 🔧 URL de tu backend (desde variables de entorno)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

console.log('🔗 API URL configurada:', API_URL);

const productosService = {
  // 📦 Obtener todos los productos
  getAll: async (params = {}) => {
    try {
      console.log('📦 Obteniendo todos los productos...');
      const response = await axios.get(`${API_URL}/productos`, { params });
      console.log(`✅ Se obtuvieron ${response.data.length} productos`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener productos:', error);
      throw error;
    }
  },

  // 🔍 Obtener un producto por ID
  getById: async (id) => {
    try {
      console.log(`🔍 Obteniendo producto con ID: ${id}`);
      const response = await axios.get(`${API_URL}/productos/${id}`);
      console.log(`✅ Producto obtenido: ${response.data.nombre}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener producto:', error);
      throw error;
    }
  },

  // ➕ Crear un nuevo producto
  create: async (producto) => {
    try {
      console.log('➕ Creando nuevo producto:', producto.nombre);
      const response = await axios.post(`${API_URL}/productos`, producto);
      console.log(`✅ Producto creado con ID: ${response.data.id_producto}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      throw error;
    }
  },

  // 🔄 Actualizar un producto
  update: async (id, producto) => {
    try {
      console.log(`🔄 Actualizando producto ID: ${id}`);
      const response = await axios.put(`${API_URL}/productos/${id}`, producto);
      console.log('✅ Producto actualizado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      throw error;
    }
  },

  // 🗑️ Desactivar un producto
  delete: async (id) => {
    try {
      console.log(`🗑️ Desactivando producto ID: ${id}`);
      const response = await axios.delete(`${API_URL}/productos/${id}`);
      console.log('✅ Producto desactivado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al desactivar producto:', error);
      throw error;
    }
  },

  // 📊 Obtener estadísticas del inventario ⬅️ AGREGAR ESTE MÉTODO AQUÍ
  getStats: async () => {
    try {
      console.log('📊 Obteniendo estadísticas del inventario...');
      const response = await axios.get(`${API_URL}/productos/stats/inventario`);
      console.log('✅ Estadísticas obtenidas');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }
};

export default productosService;