from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/roles")
def get_roles(request: Request):
    return {"message": "roles endpoint hit"}