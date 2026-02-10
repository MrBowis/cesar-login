"""
Servicio de Cifrado César
Implementa el cifrado y descifrado usando el método César
"""


class CesarService:
    """
    Servicio para cifrado/descifrado César
    """
    
    def __init__(self):
        """
        Constructor del servicio César
        """
        pass
    
    def encrypt(self, text: str, shift: int) -> str:
        """
        Cifra un texto usando el cifrado César
        
        Args:
            text: Texto a cifrar
            shift: Número de posiciones a desplazar (puede ser negativo)
            
        Returns:
            Texto cifrado
        """
        result = []
        
        for char in text:
            if char.isalpha():
                # Determinar si es mayúscula o minúscula
                ascii_offset = ord('A') if char.isupper() else ord('a')
                
                # Aplicar desplazamiento circular
                shifted = (ord(char) - ascii_offset + shift) % 26
                result.append(chr(shifted + ascii_offset))
            else:
                # Mantener caracteres no alfabéticos sin cambios
                result.append(char)
        
        return ''.join(result)
    
    def decrypt(self, text: str, shift: int) -> str:
        """
        Descifra un texto cifrado con César
        
        Args:
            text: Texto cifrado
            shift: Número de posiciones usadas en el cifrado
            
        Returns:
            Texto descifrado
        """
        # Descifrar es equivalente a cifrar con desplazamiento negativo
        return self.encrypt(text, -shift)
    
    def validate_shift(self, shift: int) -> bool:
        """
        Valida que el desplazamiento esté en un rango razonable
        
        Args:
            shift: Desplazamiento a validar
            
        Returns:
            True si es válido
        """
        # Permitir cualquier entero (el módulo 26 se encarga del resto)
        return isinstance(shift, int)
