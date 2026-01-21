import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlesPaginacion from '../components/ControlesPaginacion';

describe('ControlesPaginacion', () => {
  it('muestra estado y maneja acciones', () => {
    const onTamPagina = vi.fn();
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(
      <ControlesPaginacion
        paginaActual={1}
        totalPaginas={3}
        tamPagina={12}
        onTamPagina={onTamPagina}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    expect(screen.getByText(/Página 1 de 3/)).toBeTruthy();
    fireEvent.change(screen.getByDisplayValue('12'), { target: { value: '16' } });
    expect(onTamPagina).toHaveBeenCalledWith(16);
    const anteriorBtn = screen.getByText('Anterior');
    expect(anteriorBtn.getAttribute('disabled')).not.toBeNull();
    fireEvent.click(screen.getByText('Siguiente'));
    expect(onNext).toHaveBeenCalled();
  });
});
