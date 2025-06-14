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
        # Используем async HTTP клиент
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "http://150.254.78.131:8000/query",
                headers={"Content-Type": "application/json"},
                json={
                    "prompt": data.message,
                    "model": "gpt-4o",  # Убедитесь, что это правильная модель
                    "temperature": 1,
                    "use_web_search": False
                }
            )
            # Проверяем статус ответа от сервера
            res.raise_for_status()

            # Попробуем получить JSON-ответ от внешнего API
            response_data = res.json()

            # Убедитесь, что ответ содержит поле "response"
            if "response" in response_data:
                return {"response": response_data["response"]}
            else:
                raise HTTPException(status_code=500, detail="Invalid response structure from AI server")

    except httpx.HTTPError as e:
        # Ошибка при запросе
        raise HTTPException(status_code=502, detail=f"AI server error: {str(e)}")
    except Exception as e:
        # Общая ошибка для любых других исключений
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
