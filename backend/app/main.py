from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.pdf import router as pdf_router
from app.routes.image import router as image_router

from app.routes.delete_chat import router as delete_chat_router
from app.routes.update_chat_title import router as update_chat_title_router
from app.routes.get_messages import router as get_messages_router
from app.routes.get_chats import router as get_chats_router
from app.routes.new_chat import router as new_chat_router

from app.routes.home import router as home_router
from app.routes.login import router as login_router
from app.routes.register import router as register_router
from app.routes.profile import router as profile_router
from app.routes.forgot_password import router as forgot_password_router
from app.routes.verify_otp import router as verify_otp_router
from app.routes.reset_password import router as reset_password_router
from app.routes.chat import router as chat_router
from app.routes.pdf_tools import router as pdf_tools_router
from app.routes.voice import router as voice_router
from app.routes.change_password import router as change_password_router
from app.routes.tts import router as tts_router


app = FastAPI(
    title="Garuda API",
    version="1.0"
)


# ============================================================
# CORS MIDDLEWARE
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ============================================================
# BASIC ROUTES
# ============================================================

app.include_router(
    home_router
)

app.include_router(
    login_router
)

app.include_router(
    register_router
)

app.include_router(
    profile_router
)

app.include_router(
    forgot_password_router
)

app.include_router(
    verify_otp_router
)

app.include_router(
    reset_password_router
)


# ============================================================
# CHAT ROUTES
# ============================================================

app.include_router(
    chat_router
)

app.include_router(
    new_chat_router
)

app.include_router(
    get_chats_router
)

app.include_router(
    get_messages_router
)

app.include_router(
    update_chat_title_router
)

app.include_router(
    delete_chat_router
)


# ============================================================
# DOCUMENT / PDF ROUTES
# ============================================================

app.include_router(
    pdf_router
)

app.include_router(
    pdf_tools_router
)


# ============================================================
# IMAGE INTELLIGENCE ROUTES
# ============================================================

app.include_router(
    image_router
)


# ============================================================
# OTHER ROUTES
# ============================================================

app.include_router(
    voice_router
)
app.include_router(
    tts_router
)

app.include_router(
    change_password_router
)
