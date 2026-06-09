from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/trends")
def get_trends(request: Request):
    return {"message": "trends endpoint hit"}