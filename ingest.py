from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
import os

# Path to PDF
pdf_path = "../notes/DSA.pdf"

if not os.path.exists(pdf_path):
    print(" PDF not found:", pdf_path)
    exit()

print(" Loading PDF...")
loader = PyPDFLoader(pdf_path)
documents = loader.load()

print(f" Loaded {len(documents)} pages")

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

chunks = text_splitter.split_documents(documents)

print(f"Created {len(chunks)} chunks")

# Ollama embeddings
embeddings = OllamaEmbeddings(
    model="nomic-embed-text"
)

print(" Creating Chroma Database...")

db = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./db"
)

print(" Vector Database Created Successfully!")
