"""
Modelo de Historial de Cifrado César
Almacena las operaciones de cifrado/descifrado de cada usuario
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
import uuid
from app.database import Base


class CesarOperationType(str, enum.Enum):
    """Enum para tipo de operación César"""
    ENCRYPT = "ENCRYPT"
    DECRYPT = "DECRYPT"


class CesarHistory(Base):
    """
    Modelo de historial de operaciones César
    Registra cada cifrado/descifrado realizado por un usuario
    """
    __tablename__ = "cesar_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Datos de la operación
    operation_type = Column(String, nullable=False)  # ENCRYPT o DECRYPT
    input_text = Column(Text, nullable=False)  # Texto original
    output_text = Column(Text, nullable=False)  # Texto resultante
    shift = Column(Integer, nullable=False)  # Desplazamiento usado
    
    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self) -> str:
        return f"<CesarHistory(id={self.id}, user_id={self.user_id}, operation={self.operation_type}, shift={self.shift})>"
