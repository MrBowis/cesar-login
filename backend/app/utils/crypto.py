"""
Módulo de cifrado AES-256 para protección de datos en reposo
Implementa cifrado simétrico para proteger secretos TOTP en la base de datos
"""
import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding


class AESCipher:
    """
    Implementación de cifrado AES-256 en modo CBC
    """
    
    def __init__(self, key: str):
        """
        Inicializa el cifrador con una clave
        
        Args:
            key: Clave de cifrado (debe ser de 32 bytes para AES-256)
                 Si es más corta, se rellena. Si es más larga, se trunca.
        """
        # Asegurar que la clave tenga exactamente 32 bytes (256 bits)
        key_bytes = key.encode('utf-8')
        
        if len(key_bytes) < 32:
            # Rellenar con ceros si es muy corta
            key_bytes = key_bytes.ljust(32, b'\0')
        elif len(key_bytes) > 32:
            # Truncar si es muy larga
            key_bytes = key_bytes[:32]
        
        self.key = key_bytes
    
    def encrypt(self, plaintext: str) -> str:
        """
        Cifra un texto plano usando AES-256-CBC
        
        Args:
            plaintext: Texto a cifrar
            
        Returns:
            Texto cifrado en formato base64 (IV + ciphertext)
        """
        # Generar un IV (Initialization Vector) aleatorio de 16 bytes
        iv = os.urandom(16)
        
        # Crear el cifrador
        cipher = Cipher(
            algorithms.AES(self.key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        
        # Aplicar padding PKCS7 al texto plano
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(plaintext.encode('utf-8')) + padder.finalize()
        
        # Cifrar
        ciphertext = encryptor.update(padded_data) + encryptor.finalize()
        
        # Combinar IV + ciphertext y codificar en base64
        encrypted_data = iv + ciphertext
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt(self, encrypted_text: str) -> str:
        """
        Descifra un texto cifrado con AES-256-CBC
        
        Args:
            encrypted_text: Texto cifrado en formato base64 (IV + ciphertext)
            
        Returns:
            Texto plano descifrado
            
        Raises:
            ValueError: Si el texto cifrado es inválido o está corrupto
        """
        try:
            # Decodificar de base64
            encrypted_data = base64.b64decode(encrypted_text.encode('utf-8'))
            
            # Extraer IV (primeros 16 bytes) y ciphertext
            iv = encrypted_data[:16]
            ciphertext = encrypted_data[16:]
            
            # Crear el descifrador
            cipher = Cipher(
                algorithms.AES(self.key),
                modes.CBC(iv),
                backend=default_backend()
            )
            decryptor = cipher.decryptor()
            
            # Descifrar
            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            
            # Remover padding PKCS7
            unpadder = padding.PKCS7(128).unpadder()
            plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
            
            return plaintext.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Error al descifrar: {str(e)}")


# Instancia global del cifrador (se inicializa desde settings)
_cipher_instance = None


def get_cipher(encryption_key: str = None) -> AESCipher:
    """
    Obtiene la instancia del cifrador (Singleton pattern)
    
    Args:
        encryption_key: Clave de cifrado (solo necesaria en la primera llamada)
        
    Returns:
        Instancia de AESCipher
    """
    global _cipher_instance
    
    if _cipher_instance is None:
        if encryption_key is None:
            raise ValueError("Se debe proporcionar una clave de cifrado en la primera inicialización")
        _cipher_instance = AESCipher(encryption_key)
    
    return _cipher_instance


def encrypt_secret(plaintext: str, encryption_key: str = None) -> str:
    """
    Función de conveniencia para cifrar un secreto
    
    Args:
        plaintext: Texto a cifrar
        encryption_key: Clave de cifrado (opcional si ya se inicializó)
        
    Returns:
        Texto cifrado en base64
    """
    cipher = get_cipher(encryption_key)
    return cipher.encrypt(plaintext)


def decrypt_secret(encrypted_text: str, encryption_key: str = None) -> str:
    """
    Función de conveniencia para descifrar un secreto
    
    Args:
        encrypted_text: Texto cifrado en base64
        encryption_key: Clave de cifrado (opcional si ya se inicializó)
        
    Returns:
        Texto plano descifrado
    """
    cipher = get_cipher(encryption_key)
    return cipher.decrypt(encrypted_text)
