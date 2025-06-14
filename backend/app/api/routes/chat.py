from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/send", response_model=ChatResponse)
async def chat_with_ai(data: ChatRequest):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "http://150.254.78.131:8000/query",
                headers={"Content-Type": "application/json"},
                json={
                    "prompt": data.message,
                    "model": "gpt-4o",
                    "temperature": 1,
                    "use_web_search": False
                }
            )
            res.raise_for_status()
            return {"response": res.json()["response"]}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"AI server error: {str(e)}")