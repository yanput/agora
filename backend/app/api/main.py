from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils, researchers, researcher_profile
from app.core.config import settings
from app.api.routes.chat import router as chat_router

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
api_router.include_router(researchers.router, prefix="/researchers", tags=["researchers"])
api_router.include_router(researcher_profile.router, prefix="/researchers", tags=["researcher_profile"])

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)