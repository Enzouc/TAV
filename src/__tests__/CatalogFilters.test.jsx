import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FiltrosCatalogo from '../components/FiltrosCatalogo';

describe('FiltrosCatalogo', () => {
  it('renderiza y dispara callbacks', () => {
    const onFiltroTexto = vi.fn();
    const onFiltroCategoria = vi.fn();
    const onOrden = vi.fn();
    const onVista = vi.fn();

    render(
      <FiltrosCatalogo
        categorias={['todas', 'Normal']}
        filtroTexto=""
        onFiltroTexto={onFiltroTexto}
        filtroCategoria="todas"
        onFiltroCategoria={onFiltroCategoria}
        orden="precio_asc"
        onOrden={onOrden}
        vista="grid"
        onVista={onVista}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre, descripción o categoría'), { target: { value: 'gas' } });
    expect(onFiltroTexto).toHaveBeenCalledWith('gas');

    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Normal' } });
    expect(onFiltroCategoria).toHaveBeenCalledWith('Normal');

    fireEvent.change(screen.getByLabelText('Orden'), { target: { value: 'precio_desc' } });
    expect(onOrden).toHaveBeenCalledWith('precio_desc');

    fireEvent.click(screen.getByText('Lista'));
    expect(onVista).toHaveBeenCalledWith('list');
  });
});
