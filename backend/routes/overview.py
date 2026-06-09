from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/overview")
def get_overview(request: Request):
    return {"message": "overview endpoint hit"}