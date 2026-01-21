import { describe, it, expect } from 'vitest';
import { aplicarFormatoMoneda } from '../datos';

describe('Utilidades de Datos', () => {
    it('aplicarFormatoMoneda debería formatear correctamente valores CLP', () => {
        // El espacio es un espacio de no separación (NBSP) en algunas implementaciones de Intl, 
        // o espacio normal. Para ser seguros, verificamos partes clave.
        const valor = 15000;
        const resultado = aplicarFormatoMoneda(valor);
        
        expect(resultado).toContain('$');
        expect(resultado).toContain('15.000');
    });

    it('aplicarFormatoMoneda debería manejar 0', () => {
        const resultado = aplicarFormatoMoneda(0);
        expect(resultado).toContain('$');
        expect(resultado).toContain('0');
    });
});
