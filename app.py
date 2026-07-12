from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import subprocess
import os

from rag import retrieve_context
from llm import ask_llama

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "StudyAI Backend Running"}


# ---------------- PDF Upload ---------------- #

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    notes_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "notes"
    )

    os.makedirs(notes_dir, exist_ok=True)

    file_path = os.path.join(notes_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    subprocess.run(
        ["python3", "ingest.py"],
        cwd=os.path.dirname(__file__)
    )

    return {
        "message": "PDF uploaded and indexed successfully!"
    }


# ---------------- Ask AI ---------------- #

@app.post("/ask")
def ask(question: Question):

    docs = retrieve_context(question.question)

    if not docs:
        return {
            "answer": "I couldn't find anything in the uploaded notes."
        }

    context = "\n\n".join(
        doc.page_content for doc in docs
    )

    answer = ask_llama(
        question.question,
        context
    )

    return {
        "answer": answer
    }
