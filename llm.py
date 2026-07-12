import ollama

def ask_llama(question, context):

    prompt = f"""
You are StudyAI.

Answer ONLY from the context below.

If the answer is not in the context, reply:

"I couldn't find that in the uploaded notes."

Context:
{context}

Question:
{question}
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ]
    )

    return response["message"]["content"]
