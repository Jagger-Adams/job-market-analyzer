from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend.db import get_conn, close_conn
from backend.routes import overview, trends, explore, roles

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.conn = get_conn()
    yield
    close_conn(app.state.conn)

app = FastAPI(lifespan=lifespan)

app.include_router(overview.router)
app.include_router(trends.router)
app.include_router(explore.router)
app.include_router(roles.router)