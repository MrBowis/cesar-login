"""
Repositorio de Historial César
Maneja operaciones CRUD del historial de cifrado/descifrado César
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.cesar_history import CesarHistory, CesarOperationType


class CesarRepository:
    """
    Repositorio para operaciones de base de datos con historial César
    Implementa el patrón Repository
    """
    
    def __init__(self, db: Session):
        """
        Constructor con inyección de dependencias
        
        Args:
            db: Sesión de SQLAlchemy
        """
        self.db = db
    
    def create(
        self,
        user_id: UUID,
        operation_type: CesarOperationType,
        input_text: str,
        output_text: str,
        shift: int
    ) -> CesarHistory:
        """
        Crea un nuevo registro en el historial
        
        Args:
            user_id: UUID del usuario
            operation_type: Tipo de operación (ENCRYPT/DECRYPT)
            input_text: Texto original
            output_text: Texto resultante
            shift: Desplazamiento usado
            
        Returns:
            Registro de historial creado
        """
        history = CesarHistory(
            user_id=user_id,
            operation_type=operation_type.value,
            input_text=input_text,
            output_text=output_text,
            shift=shift
        )
        
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        
        return history
    
    def get_by_id(self, history_id: UUID) -> Optional[CesarHistory]:
        """
        Obtiene un registro de historial por su ID
        
        Args:
            history_id: UUID del registro
            
        Returns:
            Registro de historial o None si no existe
        """
        return self.db.query(CesarHistory).filter(
            CesarHistory.id == history_id
        ).first()
    
    def get_user_history(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> List[CesarHistory]:
        """
        Obtiene el historial de un usuario
        
        Args:
            user_id: UUID del usuario
            limit: Máximo número de registros a retornar
            offset: Número de registros a saltar
            
        Returns:
            Lista de registros de historial (más recientes primero)
        """
        return self.db.query(CesarHistory).filter(
            CesarHistory.user_id == user_id
        ).order_by(
            desc(CesarHistory.created_at)
        ).limit(limit).offset(offset).all()
    
    def count_user_history(self, user_id: UUID) -> int:
        """
        Cuenta el total de registros de un usuario
        
        Args:
            user_id: UUID del usuario
            
        Returns:
            Número total de registros
        """
        return self.db.query(CesarHistory).filter(
            CesarHistory.user_id == user_id
        ).count()
    
    def delete(self, history_id: UUID) -> bool:
        """
        Elimina un registro de historial
        
        Args:
            history_id: UUID del registro
            
        Returns:
            True si se eliminó, False si no existía
        """
        history = self.get_by_id(history_id)
        
        if not history:
            return False
        
        self.db.delete(history)
        self.db.commit()
        
        return True
    
    def delete_user_history(self, user_id: UUID) -> int:
        """
        Elimina todo el historial de un usuario
        
        Args:
            user_id: UUID del usuario
            
        Returns:
            Número de registros eliminados
        """
        deleted_count = self.db.query(CesarHistory).filter(
            CesarHistory.user_id == user_id
        ).delete()
        
        self.db.commit()
        
        return deleted_count
