import { z } from 'zod';

// Esquema de Usuario (Registro/Edición)
export const userSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  rol: z.enum(['usuario', 'repartidor', 'admin']).optional(),
  telefono: z.string().regex(/^(\+56\s?9\s?\d{4}\s?\d{4}|\+?\d{8,12})$/, 'Formato de teléfono inválido').optional().or(z.literal('')),
});

// Esquema de Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
});

// Esquema de Producto
export const productSchema = z.object({
  nombre: z.string().min(3, 'El nombre del producto es muy corto'),
  precio: z.number().positive('El precio debe ser positivo'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo'),
  categoria: z.string().min(1, 'La categoría es requerida'),
});

// Esquema de Pedido
export const orderItemSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precio: z.number(),
  cantidad: z.number().int().positive(),
});

export const orderSchema = z.object({
  idUsuario: z.string(),
  items: z.array(orderItemSchema).min(1, 'El pedido debe tener al menos un producto'),
  total: z.number().positive(),
  direccion: z.string().min(5, 'La dirección es muy corta'),
});

// Helper para validar
export const validate = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    const errors = error.errors.map(e => e.message).join(', ');
    return { success: false, error: errors };
  }
};
