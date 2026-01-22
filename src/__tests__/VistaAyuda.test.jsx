import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VistaAyuda from '../views/VistaAyuda';

describe('VistaAyuda', () => {
  it('muestra título y textarea de soporte', () => {
    render(
      <MemoryRouter>
        <VistaAyuda />
      </MemoryRouter>
    );
    // Uso de getAllByText para evitar errores si hay múltiples elementos "Ayuda" (ej. en el menú y en el título)
    expect(screen.getAllByText('Ayuda').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Describe tu problema...')).toBeTruthy();
    expect(screen.getByText('Enviar mensaje')).toBeTruthy();
  });

  it('renderiza las preguntas frecuentes y el enlace a Zonas', () => {
    render(
      <MemoryRouter>
        <VistaAyuda />
      </MemoryRouter>
    );
    expect(screen.getAllByText('Preguntas Frecuentes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('¿Cuánto tarda el despacho?').length).toBeGreaterThan(0);
    expect(screen.getAllByText('¿Qué medios de pago aceptan?').length).toBeGreaterThan(0);
    expect(screen.getAllByText('¿Cuáles son las zonas de entrega?').length).toBeGreaterThan(0);

    const linksZonas = screen.getAllByText('Zonas de Reparto');
    expect(linksZonas.length).toBeGreaterThan(0);
    expect(linksZonas[0].getAttribute('href')).toBe('/zonas');
  });
});
