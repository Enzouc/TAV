import { z } from 'zod';

// Esquema de Usuario (Registro/Edición)
export const userSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  contrasena: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial')
      .optional().or(z.literal('')),
  rol: z.enum(['usuario', 'repartidor', 'admin']).optional(),
  telefono: z.string().regex(/^(\+56\s?9\s?\d{4}\s?\d{4}|\+?\d{8,12})$/, 'Formato de teléfono inválido').optional().or(z.literal('')),
  direccion: z.object({
    calle: z.string().optional(),
    numero: z.string().optional(),
    comuna: z.string().refine(val => ['Concepción', 'Talcahuano', 'Hualpén', 'San Pedro de la Paz', 'Chiguayante'].includes(val), {
        message: "La comuna debe ser Concepción o alrededores (Talcahuano, Hualpén, San Pedro, Chiguayante)"
    }).optional(),
    region: z.string().refine(val => ['Biobío', 'Región del Biobío'].includes(val), {
        message: "La región debe ser Biobío"
    }).optional()
  }).optional().or(z.string())
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
  id_producto: z.string(),
  nombre_producto: z.string().optional(),
  precio_unitario: z.number(),
  cantidad: z.number().int().positive(),
});

export const orderSchema = z.object({
  id_usuario: z.string(),
  items: z.array(orderItemSchema).min(1, 'El pedido debe tener al menos un producto'),
  total: z.number().positive(),
  direccion_envio: z.string().min(5, 'La dirección es muy corta'),
  metodo_pago: z.string().optional(),
  nombre_usuario: z.string().optional(),
});

// Helper para validar
export const validate = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    if (error && error.errors) {
        const errors = error.errors.map(e => e.message).join(', ');
        const fieldErrors = {};
        error.errors.forEach(e => {
            const path = e.path.join('.');
            fieldErrors[path] = e.message;
        });
        return { success: false, error: errors, fieldErrors };
    }
    return { success: false, error: error.message || 'Error de validación desconocido' };
  }
};
