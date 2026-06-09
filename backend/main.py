from fastapi import FastAPI
from contextlib import asynccontextmanager
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.conn = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )
    yield
    app.state.conn.close()

app = FastAPI(lifespan=lifespan)

@app.get("/overview")
def get_overview(request):
    pass

@app.get("/trends")
def get_trends(request):
    pass

@app.get("/explore")
def get_explore(request):
    pass