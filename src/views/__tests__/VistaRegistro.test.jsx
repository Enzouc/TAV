import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import VistaRegistro from '../VistaRegistro';
import { BrowserRouter } from 'react-router-dom';
import * as usersService from '../../services/usersService';
import * as almacenamiento from '../../utils/almacenamiento';
import * as contextoUI from '../../components/ContextoUI';

// Mocks
vi.mock('../../services/usersService', () => ({
    register: vi.fn()
}));

vi.mock('../../utils/almacenamiento', () => ({
    guardarUsuarioActual: vi.fn()
}));

const mockMostrarNotificacion = vi.fn();
vi.mock('../../components/ContextoUI', () => ({
    usarUI: () => ({
        mostrarNotificacion: mockMostrarNotificacion
    })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('VistaRegistro', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <VistaRegistro />
            </BrowserRouter>
        );
    };

    it('renderiza el formulario correctamente', () => {
        renderComponent();
        expect(screen.getByText('Crear Cuenta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('juan@ejemplo.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('+56 9 1234 5678')).toBeInTheDocument();
        // Check for multiple password fields
        const passwordFields = screen.getAllByLabelText(/Contraseña/i);
        expect(passwordFields.length).toBeGreaterThanOrEqual(2);
    });

    it('muestra error si las contraseñas no coinciden', async () => {
        renderComponent();
        
        fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '+56912345678' } });
        
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'password456' } });

        fireEvent.change(screen.getByLabelText('Calle'), { target: { value: 'Calle Test' } });
        fireEvent.change(screen.getByLabelText('Número'), { target: { value: '123' } });
        fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Concepción' } });

        const submitBtn = screen.getByRole('button', { name: /Registrarse/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
        });
        expect(usersService.register).not.toHaveBeenCalled();
    });

    it('realiza registro exitoso y redirige', async () => {
        const mockUserResponse = {
            id: '#U123',
            nombre: 'Test User',
            email: 'test@example.com',
            token: 'fake-jwt-token',
            rol: 'usuario'
        };
        usersService.register.mockResolvedValue(mockUserResponse);

        renderComponent();

        // Fill form
        fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '+56912345678' } });
        
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'password123' } });

        // Fill address
        fireEvent.change(screen.getByLabelText('Calle'), { target: { value: 'Calle Test' } });
        fireEvent.change(screen.getByLabelText('Número'), { target: { value: '123' } });
        
        fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Concepción' } });

        const submitBtn = screen.getByRole('button', { name: /Registrarse/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(usersService.register).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(almacenamiento.guardarUsuarioActual).toHaveBeenCalledWith(mockUserResponse);
            expect(mockNavigate).toHaveBeenCalledWith('/perfil');
        });
    });

    it('maneja error del servidor', async () => {
        const errorMsg = 'El correo ya existe';
        usersService.register.mockRejectedValue({
            response: {
                data: {
                    message: errorMsg
                }
            }
        });

        renderComponent();

        // Fill all required fields
        fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'existing@example.com' } });
        fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '+56912345678' } });
        
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'password123' } });

        fireEvent.change(screen.getByLabelText('Calle'), { target: { value: 'Calle Test' } });
        fireEvent.change(screen.getByLabelText('Número'), { target: { value: '123' } });
        fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Concepción' } });

        const submitBtn = screen.getByRole('button', { name: /Registrarse/i });
        fireEvent.click(submitBtn);

        // Use findByText which waits automatically
        const errorElement = await screen.findByText(errorMsg);
        expect(errorElement).toBeInTheDocument();
        
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
