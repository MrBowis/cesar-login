"""
Router de Cifrado César
Endpoints para cifrar/descifrar texto usando el método César
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.cesar_history import CesarOperationType
from app.repositories.cesar_repository import CesarRepository
from app.services.cesar_service import CesarService
from app.schemas.cesar import (
    CesarEncryptRequest,
    CesarDecryptRequest,
    CesarOperationResponse,
    CesarHistoryListResponse,
    CesarHistoryItemResponse
)

router = APIRouter(
    prefix="/cesar",
    tags=["Cifrado César"]
)

# Security scheme opcional
security = HTTPBearer(auto_error=False)


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency para obtener el usuario actual de forma opcional
    No lanza excepción si no hay token
    
    Args:
        credentials: Credenciales HTTP Bearer (opcional)
        db: Sesión de base de datos
        
    Returns:
        Usuario autenticado o None
    """
    if not credentials:
        return None
    
    try:
        # Importar aquí para evitar import circular
        from app.repositories.user_repository import get_user_repository
        from app.services.auth_service import get_auth_service
        
        user_repository = get_user_repository(db)
        auth_service = get_auth_service(user_repository)
        
        payload = auth_service.decode_access_token(credentials.credentials)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user_uuid = UUID(user_id)
        return user_repository.get_by_id(user_uuid)
    except Exception:
        return None


@router.post(
    "/encrypt",
    response_model=CesarOperationResponse,
    status_code=status.HTTP_200_OK,
    summary="Cifrar texto con César",
    description="Cifra un texto usando el cifrado César. Opcionalmente guarda en el historial si el usuario está autenticado."
)
async def encrypt_text(
    request: CesarEncryptRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Cifra un texto usando el método César
    
    - Puede ser usado sin autenticación
    - Si save_to_history=true, requiere autenticación
    """
    cesar_service = CesarService()
    
    # Validar que si quiere guardar, esté autenticado
    if request.save_to_history and not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe estar autenticado para guardar en el historial",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Cifrar el texto
    encrypted_text = cesar_service.encrypt(request.text, request.shift)
    
    # Guardar en historial si se solicita
    saved_to_history = False
    if request.save_to_history and current_user:
        cesar_repository = CesarRepository(db)
        cesar_repository.create(
            user_id=current_user.id,
            operation_type=CesarOperationType.ENCRYPT,
            input_text=request.text,
            output_text=encrypted_text,
            shift=request.shift
        )
        saved_to_history = True
    
    return CesarOperationResponse(
        operation="ENCRYPT",
        input_text=request.text,
        output_text=encrypted_text,
        shift=request.shift,
        saved_to_history=saved_to_history
    )


@router.post(
    "/decrypt",
    response_model=CesarOperationResponse,
    status_code=status.HTTP_200_OK,
    summary="Descifrar texto con César",
    description="Descifra un texto cifrado con César. Opcionalmente guarda en el historial si el usuario está autenticado."
)
async def decrypt_text(
    request: CesarDecryptRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Descifra un texto cifrado con el método César
    
    - Puede ser usado sin autenticación
    - Si save_to_history=true, requiere autenticación
    """
    cesar_service = CesarService()
    
    # Validar que si quiere guardar, esté autenticado
    if request.save_to_history and not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe estar autenticado para guardar en el historial",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Descifrar el texto
    decrypted_text = cesar_service.decrypt(request.text, request.shift)
    
    # Guardar en historial si se solicita
    saved_to_history = False
    if request.save_to_history and current_user:
        cesar_repository = CesarRepository(db)
        cesar_repository.create(
            user_id=current_user.id,
            operation_type=CesarOperationType.DECRYPT,
            input_text=request.text,
            output_text=decrypted_text,
            shift=request.shift
        )
        saved_to_history = True
    
    return CesarOperationResponse(
        operation="DECRYPT",
        input_text=request.text,
        output_text=decrypted_text,
        shift=request.shift,
        saved_to_history=saved_to_history
    )


@router.get(
    "/history",
    response_model=CesarHistoryListResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener historial de operaciones",
    description="Obtiene el historial de cifrado/descifrado del usuario autenticado. Requiere autenticación."
)
async def get_history(
    limit: int = Query(50, ge=1, le=100, description="Máximo de registros"),
    offset: int = Query(0, ge=0, description="Número de registros a saltar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene el historial de operaciones César del usuario
    
    - Requiere autenticación
    - Retorna los registros más recientes primero
    """
    cesar_repository = CesarRepository(db)
    
    # Obtener historial del usuario
    items = cesar_repository.get_user_history(current_user.id, limit, offset)
    total = cesar_repository.count_user_history(current_user.id)
    
    return CesarHistoryListResponse(
        total=total,
        items=[CesarHistoryItemResponse.model_validate(item) for item in items],
        limit=limit,
        offset=offset
    )


@router.delete(
    "/history/{history_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar registro del historial",
    description="Elimina un registro específico del historial. Solo el propietario puede eliminarlo."
)
async def delete_history_item(
    history_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Elimina un registro específico del historial
    
    - Requiere autenticación
    - Solo el propietario del registro puede eliminarlo
    """
    cesar_repository = CesarRepository(db)
    
    # Verificar que el registro existe y pertenece al usuario
    history_item = cesar_repository.get_by_id(history_id)
    
    if not history_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro no encontrado"
        )
    
    if history_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para eliminar este registro"
        )
    
    # Eliminar
    cesar_repository.delete(history_id)
    
    return {"message": "Registro eliminado exitosamente"}


@router.delete(
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Eliminar todo el historial",
    description="Elimina todo el historial de cifrado/descifrado del usuario autenticado."
)
async def delete_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Elimina todo el historial del usuario
    
    - Requiere autenticación
    - Elimina todos los registros del usuario
    """
    cesar_repository = CesarRepository(db)
    
    # Eliminar todo el historial del usuario
    deleted_count = cesar_repository.delete_user_history(current_user.id)
    
    return {
        "message": f"Historial eliminado exitosamente",
        "deleted_count": deleted_count
    }
