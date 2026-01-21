import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Notificacion from '../components/Notificacion.jsx';

describe('Notificacion', () => {
  it('se cierra automáticamente después del tiempo de espera', async () => {
    vi.useFakeTimers();
    const alCerrar = vi.fn();
    render(<Notificacion tipo="info" titulo="Info" mensaje="Msg" autoCierreMs={1000} alCerrar={alCerrar} />);
    expect(screen.getByText('Info')).toBeTruthy();
    vi.advanceTimersByTime(1000);
    expect(alCerrar).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
