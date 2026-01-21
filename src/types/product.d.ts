export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen?: string;
  rating?: number;
}

export interface CatalogData {
  productos: Producto[];
}

export interface ProductCardProps {
  product: Producto;
  view?: 'grid' | 'list';
  onClick?: (p: Producto) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface VistaCatalogoProps {
  data?: CatalogData;
  initialView?: 'grid' | 'list';
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

