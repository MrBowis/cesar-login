"""
Schemas de cifrado César
"""
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field


# ============= Request Schemas =============

class CesarEncryptRequest(BaseModel):
    """Schema para solicitud de cifrado César"""
    text: str = Field(..., min_length=1, description="Texto a cifrar")
    shift: int = Field(..., description="Desplazamiento (puede ser negativo)")
    save_to_history: bool = Field(
        default=False,
        description="Guardar en historial (requiere autenticación)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Hello World",
                "shift": 3,
                "save_to_history": False
            }
        }


class CesarDecryptRequest(BaseModel):
    """Schema para solicitud de descifrado César"""
    text: str = Field(..., min_length=1, description="Texto a descifrar")
    shift: int = Field(..., description="Desplazamiento usado en el cifrado")
    save_to_history: bool = Field(
        default=False,
        description="Guardar en historial (requiere autenticación)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Khoor Zruog",
                "shift": 3,
                "save_to_history": False
            }
        }


# ============= Response Schemas =============

class CesarOperationResponse(BaseModel):
    """Schema para respuesta de operación César"""
    operation: Literal["ENCRYPT", "DECRYPT"] = Field(..., description="Tipo de operación")
    input_text: str = Field(..., description="Texto original")
    output_text: str = Field(..., description="Texto resultante")
    shift: int = Field(..., description="Desplazamiento usado")
    saved_to_history: bool = Field(..., description="Si se guardó en el historial")
    
    class Config:
        json_schema_extra = {
            "example": {
                "operation": "ENCRYPT",
                "input_text": "Hello World",
                "output_text": "Khoor Zruog",
                "shift": 3,
                "saved_to_history": False
            }
        }


class CesarHistoryItemResponse(BaseModel):
    """Schema para un elemento del historial"""
    id: UUID = Field(..., description="ID del registro")
    operation_type: str = Field(..., description="Tipo de operación")
    input_text: str = Field(..., description="Texto original")
    output_text: str = Field(..., description="Texto resultante")
    shift: int = Field(..., description="Desplazamiento usado")
    created_at: datetime = Field(..., description="Fecha de creación")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "operation_type": "ENCRYPT",
                "input_text": "Hello World",
                "output_text": "Khoor Zruog",
                "shift": 3,
                "created_at": "2026-02-09T10:30:00"
            }
        }


class CesarHistoryListResponse(BaseModel):
    """Schema para lista de historial"""
    total: int = Field(..., description="Total de registros del usuario")
    items: list[CesarHistoryItemResponse] = Field(..., description="Lista de registros")
    limit: int = Field(..., description="Límite aplicado")
    offset: int = Field(..., description="Offset aplicado")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 10,
                "items": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "operation_type": "ENCRYPT",
                        "input_text": "Hello World",
                        "output_text": "Khoor Zruog",
                        "shift": 3,
                        "created_at": "2026-02-09T10:30:00"
                    }
                ],
                "limit": 50,
                "offset": 0
            }
        }
