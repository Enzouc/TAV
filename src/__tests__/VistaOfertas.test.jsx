import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProveedorUI } from '../components/ContextoUI';
import VistaOfertas from '../views/VistaOfertas';

describe('VistaOfertas', () => {
  it('muestra el título y las tarjetas de oferta', () => {
    render(<ProveedorUI><VistaOfertas /></ProveedorUI>);
    expect(screen.getByText('Ofertas Especiales')).toBeTruthy();
    expect(screen.getByText('Aprovecha nuestros descuentos por tiempo limitado.')).toBeTruthy();

    expect(screen.getByAltText('Pack Familiar 15Kg')).toBeTruthy();
    expect(screen.getByAltText('Camping Pack 5Kg')).toBeTruthy();
    expect(screen.getByAltText('Cilindro Industrial 45Kg')).toBeTruthy();
  });

  it('muestra precios formateados para cada oferta', () => {
    render(<ProveedorUI><VistaOfertas /></ProveedorUI>);
    const preciosVisibles = screen.getAllByText((t) => /\$\s*\d/.test(t));
    expect(preciosVisibles.length).toBeGreaterThan(0);
  });
});
