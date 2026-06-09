from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/explore")
def get_explore(request: Request):
    return {"message": "explore endpoint hit"}