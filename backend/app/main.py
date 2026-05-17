from __future__ import annotations

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routes import router
from config import WEB_DIR
from repositories.db import init_db
from centers.operations import ensure_default_user


def create_app() -> FastAPI:
    init_db()
    ensure_default_user()
    app = FastAPI(title='Process Intelligence', version='0.2.0')
    app.include_router(router)
    app.mount('/', StaticFiles(directory=WEB_DIR, html=True), name='web')
    return app


app = create_app()

