"""File upload routes with validation, image compression, and secure storage."""

import os
import uuid
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.media import Media
from app.models.case import MissingPersonCase, TimelineEvent, TimelineEventType
from app.models.sighting import Sighting
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/uploads", tags=["Media Uploads"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
ALLOWED_DOC_TYPES = {"application/pdf"}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def compress_image(file_path: str, quality: int = 75):
    """Compress an image using Pillow (simulating production image optimization)."""
    try:
        from PIL import Image
        img = Image.open(file_path)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # Resize if larger than 2048px
        max_dim = 2048
        if max(img.size) > max_dim:
            ratio = max_dim / max(img.size)
            img = img.resize((int(img.size[0] * ratio), int(img.size[1] * ratio)), Image.LANCZOS)
        compressed_path = file_path.replace(".", "_compressed.")
        img.save(compressed_path, quality=quality, optimize=True)
        # Replace original with compressed
        os.replace(compressed_path, file_path)
        return os.path.getsize(file_path)
    except ImportError:
        return os.path.getsize(file_path)


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    case_id: str = Form(None),
    sighting_id: str = Form(None),
    compress: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a file (image, video, or document) with optional compression."""
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES | ALLOWED_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed: image/jpeg, image/png, image/webp, video/mp4, application/pdf",
        )

    # Validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    # Determine file type category
    if file.content_type in ALLOWED_IMAGE_TYPES:
        file_category = "image"
    elif file.content_type in ALLOWED_VIDEO_TYPES:
        file_category = "video"
    else:
        file_category = "document"

    # Secure filename: UUID + original extension
    ext = Path(file.filename).suffix if file.filename else ".bin"
    secure_name = f"{uuid.uuid4().hex}{ext}"
    date_path = datetime.utcnow().strftime("%Y/%m/%d")
    full_path = Path(settings.UPLOAD_DIR) / date_path
    full_path.mkdir(parents=True, exist_ok=True)
    file_path = full_path / secure_name

    # Write file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Compute SHA-256 for integrity
    sha256 = hashlib.sha256(contents).hexdigest()

    # Compress if image
    original_size = len(contents)
    final_size = original_size
    if compress and file_category == "image" and original_size > 100 * 1024:  # > 100KB
        try:
            final_size = compress_image(str(file_path))
        except Exception:
            pass  # compression failed, use original

    # Create media record
    media = Media(
        case_id=case_id,
        sighting_id=sighting_id,
        file_name=file.filename or secure_name,
        file_path=str(file_path),
        file_type=file_category,
        mime_type=file.content_type or "application/octet-stream",
        file_size_bytes=final_size,
        uploaded_by=current_user.id,
    )
    db.add(media)

    # Add timeline event if linked to a case
    if case_id:
        case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
        if case:
            db.add(TimelineEvent(
                case_id=case_id,
                event_type=TimelineEventType.EVIDENCE,
                title=f"{file_category.title()} Uploaded: {file.filename}",
                description=f"{file_category.title()} evidence ({final_size // 1024}KB) uploaded by {current_user.name}",
                created_by=current_user.id,
            ))

    db.commit()
    db.refresh(media)

    return {
        "id": media.id,
        "file_name": media.file_name,
        "file_type": media.file_type,
        "mime_type": media.mime_type,
        "file_size_bytes": media.file_size_bytes,
        "original_size_bytes": original_size,
        "compression_ratio": round((1 - final_size / max(original_size, 1)) * 100, 1),
        "sha256": sha256,
        "url": f"/uploads/{date_path}/{secure_name}",
        "created_at": media.created_at.isoformat(),
    }


@router.get("", response_model=list[dict])
def list_uploads(
    case_id: str = None,
    sighting_id: str = None,
    file_type: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List uploaded files with optional filters."""
    query = db.query(Media)
    if case_id:
        query = query.filter(Media.case_id == case_id)
    if sighting_id:
        query = query.filter(Media.sighting_id == sighting_id)
    if file_type:
        query = query.filter(Media.file_type == file_type)

    media_list = query.order_by(Media.created_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": m.id,
            "file_name": m.file_name,
            "file_type": m.file_type,
            "mime_type": m.mime_type,
            "file_size_bytes": m.file_size_bytes,
            "uploaded_by": m.uploaded_by,
            "created_at": m.created_at.isoformat(),
        }
        for m in media_list
    ]


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_upload(
    media_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an uploaded file (Admin or uploader only)."""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    if current_user.role != UserRole.ADMIN and media.uploaded_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Delete physical file
    try:
        if os.path.exists(media.file_path):
            os.remove(media.file_path)
    except OSError:
        pass

    db.delete(media)
    db.commit()
    return None
