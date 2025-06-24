from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    view_type: str
    ids: list[str]

@router.post("/send", response_model=ChatResponse)
async def chat_with_ai(data: ChatRequest):
    try:
        # Используем async HTTP клиент
        async with httpx.AsyncClient() as client:
            message_text = data.message.strip().lower()

            # Ветка для кастомных ответов без запроса к AI
            if "pokaż mi proszę listę naukowców z polski!" in message_text:
                return {
                    "response": "Oto lista naukowców z Polski.",
                    "view_type": "list-researchers",
                    "ids": [
                        "1896e673-c3ac-4eac-9714-813a590e1718",
                        "fae79996-25d0-4219-83e5-a706e9f97381",
                        "90b1b331-087c-47e9-b995-0c26740db8ee",
                        "f26fa41c-a933-4f14-a053-abaf45c6a93b",
                        "af98195f-1202-4933-9ead-197d26f23288",
                        "7823b331-13d5-45d9-aa7e-5f826975cc4f",
                        "12172c59-c7fc-4140-aacd-4e010b8853c0",
                        "9ed633fa-d6e4-4205-a485-3410ea1e9ffd",
                        "2c1a4539-7950-4128-abca-fcbc14d08317",
                        "4d930cd0-1f84-4035-8433-382900df66d1",
                        "1c2923a0-76ad-4e02-bd88-d8600149ee99",
                        "88025787-92b6-4d68-bbf4-588a7c076644",
                        "df145a3f-4be4-4b59-a783-bd0bc5044b42",
                        "d23af249-a1d1-4db1-aaf8-6c1a6226f8cf",
                        "e5c198a9-f938-4f6a-a973-9cdec372a780",
                        "9c227b04-3cef-435d-b07c-c5e8987c6fa9"
                    ]
                }
            elif (
                "wróć do poprzedniego profilu" in message_text
                or "wróć do jadwigi ziaji" in message_text
                or "wróć do jadwiga ziaja" in message_text
                or "wróć" in message_text
                or "wroć" in message_text
            ):
                return {
                    "response": "Powracam do profilu naukowczyni Jadwiga Ziaja.",
                    "view_type": "profile",
                    "ids": ["88025787-92b6-4d68-bbf4-588a7c076644"]
                }
            elif (
                "grzegorz sadlok" in message_text
                or "grzegorza sadloki" in message_text
                ):
                return {
                    "response": "Oto profil naukowca Grzegorz Sadlok.",
                    "view_type": "profile",
                    "ids": ["1896e673-c3ac-4eac-9714-813a590e1718"]
                }
            elif (
                "dariusz krzyszkowski" in message_text
                or "dariusza krzyszkowskigo" in message_text
                ):
                return {
                    "response": "Oto profil naukowca Dariusz Krzyszkowski.",
                    "view_type": "profile",
                    "ids": ["fae79996-25d0-4219-83e5-a706e9f97381"]
                }
            elif (
                "instytut botaniki" in message_text
                or "instytutu botaniki" in message_text
                or "szafer" in message_text
                or "szafera" in message_text
            ):
                return {
                    "response": "Oto naukowcy z W. Szafer Institute of Botany, Polish Academy of Sciences:",
                    "view_type": "list-researchers",
                    "ids": [
                        "88025787-92b6-4d68-bbf4-588a7c076644",  # Jadwiga Ziaja
                        "df145a3f-4be4-4b59-a783-bd0bc5044b42"   # Grzegorz Worobiec
                    ]
                }
            elif (
                "jadwiga ziaja" in message_text
                or "profil jadwigi ziaji" in message_text
                or "jadwigi ziaji" in message_text
            ):
                return {
                    "response": "Oto profil naukowczyni Jadwiga Ziaja.",
                    "view_type": "profile",
                    "ids": ["88025787-92b6-4d68-bbf4-588a7c076644"]
                }
            elif (
                "grzegorz worobiec" in message_text
                or "profil grzegorza worobca" in message_text
                or "grzegorza worobca" in message_text
            ):
                return {
                    "response": "Oto profil naukowca Grzegorz Worobiec.",
                    "view_type": "profile",
                    "ids": ["df145a3f-4be4-4b59-a783-bd0bc5044b42"]
                }
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

            import json
            try:
                ai_data = res.json()
                clean_response = ai_data["response"] if isinstance(ai_data, dict) and "response" in ai_data else res.text.strip('"')
            except Exception:
                clean_response = res.text.strip('"')

            return {
                "response": clean_response,
                "view_type": "chat",
                "ids": []
            }

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"AI server error: {e.response.status_code} - {e.response.text if e.response else 'No response body'}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"AI HTTP error: {str(e)}")
