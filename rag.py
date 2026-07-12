from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings

# Load Ollama embedding model
embeddings = OllamaEmbeddings(
    model="nomic-embed-text"
)

# Load existing Chroma database
db = Chroma(
    persist_directory="./db",
    embedding_function=embeddings
)

def retrieve_context(question: str, k: int = 3):
    """
    Retrieve the top-k most relevant chunks from the vector database.
    """
    docs = db.similarity_search(question, k=k)
    return docs
