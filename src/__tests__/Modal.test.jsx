import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Modal from '../components/Modal.jsx';

describe('Modal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renderiza titulo y mensaje', () => {
    render(<Modal abierto titulo="T" mensaje="M" alCancelar={() => {}} alConfirmar={() => {}} />);
    expect(screen.getByText('T')).toBeTruthy();
    expect(screen.getByText('M')).toBeTruthy();
  });

  it('llama alConfirmar cuando se hace clic en Confirmar', () => {
    const alConfirmar = vi.fn();
    render(<Modal abierto titulo="T" mensaje="M" alCancelar={() => {}} alConfirmar={alConfirmar} />);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(alConfirmar).toHaveBeenCalled();
  });

  it('cierra con ESC cuando está habilitado', () => {
    const alCancelar = vi.fn();
    render(<Modal abierto titulo="T" mensaje="M" alCancelar={alCancelar} alConfirmar={() => {}} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(alCancelar).toHaveBeenCalled();
  });
});
