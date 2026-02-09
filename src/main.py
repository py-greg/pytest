from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from src.api import app as router

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(profile, prefix="/profile")
app.include_router(chats, prefix="/chats")

if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4444)