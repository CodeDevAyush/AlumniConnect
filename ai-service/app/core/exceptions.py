from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime, timezone


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Unified error envelope matching NestJS error response conventions."""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "statusCode": 500,
            "path": request.url.path,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": "Internal AI Service Error",
            "error": str(exc),
        },
    )
