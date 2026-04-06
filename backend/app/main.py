from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, competition, payment, submission, quiz
from app.database import engine
from app import models
from app.admin_config import setup_admin
from starlette.middleware.sessions import SessionMiddleware

# Create tables
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database connection failed. It might not be ready yet.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
def startup_event():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        comp = db.query(models.Competition).first()
        if not comp:
            default_comp = models.Competition(
                title="Big Skill Challenge - BMW X5",
                description="Win a brand new BMW X5 by testing your skills.",
                entry_fee=2.99,
                is_active=True
            )
            db.add(default_comp)
            db.commit()
        # Seed questions
        # Clear existing questions to ensure we use the new AI-specific ones
        db.query(models.Question).delete()
        ai_questions = [
            # Agentic AI
            ("What does 'ReAct' stand for in the context of AI agents?", "Reason and Act", "Retrieve and Act", "React and Action", "Reason and Action", "A"),
            ("Which framework is commonly used for building multi-agent systems?", "AutoGen", "Pandas", "React.js", "Django", "A"),
            ("What is the primary role of an 'AIAgent'?", "To perform tasks autonomously using tools", "To only chat with users", "To store data in a database", "To provide static answers", "A"),
            ("In agentic workflows, what is 'Tool Use'?", "The ability of an LLM to call external APIs/functions", "Using a physical hammer", "Writing code in Python", "Training a new model", "A"),
            ("What is 'Chain of Thought' prompting?", "A technique where the model explains its reasoning step-by-step", "A way to link multiple LLMs", "A method for faster inference", "A way to compress models", "A"),
            ("Which of these is a common autonomous agent project?", "BabyAGI", "OpenCV", "TensorFlow", "PyTorch", "A"),
            ("What is 'Self-Reflection' in AI agents?", "The agent reviewing its own output to correct errors", "The agent looking in a mirror", "The agent stopping execution", "The agent asking for user input", "A"),
            ("What is the 'Planning' phase in an agentic system?", "Determining the sequence of steps to solve a goal", "Buying compute resources", "Writing the system prompt", "Cleaning the dataset", "A"),
            ("What does 'Human-in-the-loop' mean?", "Requiring human intervention or approval at certain steps", "A human wearing a VR headset", "The AI replacing a human entirely", "Data being labeled by humans", "A"),
            ("Which component handles the selection of tools in an agent?", "The LLM (Controller)", "The Database", "The UI", "The Network Layer", "A"),

            # Generative AI & LLMs
            ("What does 'LLM' stand for?", "Large Language Model", "Long Linear Model", "Latent Logic Model", "Local Language Model", "A"),
            ("Which architecture is the foundation of most modern LLMs?", "Transformer", "RNN", "CNN", "LSTM", "A"),
            ("What is 'Tokenization'?", "Breaking text into smaller units like words or subwords", "Encrypting text", "Translating text", "Storing text in a database", "A"),
            ("What does 'GPT' stand for?", "Generative Pre-trained Transformer", "General Python Tool", "Global Prompt Technology", "Generative Prompt Transformer", "A"),
            ("What is the 'Context Window' of an LLM?", "The maximum amount of text the model can process at once", "The size of the chat window", "The time taken to generate a response", "The version number of the model", "A"),
            ("What is 'Hallucination' in LLMs?", "When the model generates confident but false information", "When the model runs out of memory", "When the model speaks a different language", "When the model refuses to answer", "A"),
            ("What is 'RLHF'?", "Reinforcement Learning from Human Feedback", "Rapid Learning for High Frequency", "Recursive Logic for Human Factors", "Resetting Loss for High Fidelity", "A"),
            ("Which company developed the Llama models?", "Meta", "Google", "OpenAI", "Microsoft", "A"),
            ("What is 'Temperature' in LLM sampling?", "A parameter controlling the randomness of the output", "The physical heat of the GPU", "The speed of the model", "The complexity of the prompt", "A"),
            ("What is 'Fine-tuning'?", "Training a pre-trained model on a specific dataset for a task", "Adjusting the volume of the response", "Writing better prompts", "Reducing the size of the model", "A"),

            # RAG (Retrieval-Augmented Generation)
            ("What does 'RAG' stand for?", "Retrieval-Augmented Generation", "Random Access Generation", "Research and Guidance", "Rapid AI Generation", "A"),
            ("What is the primary benefit of RAG?", "Reducing hallucinations by providing external facts", "Making the model faster", "Reducing the cost of training", "Improving the model's creative writing", "A"),
            ("What is a 'Vector Database' used for in RAG?", "Storing and retrieving semantic embeddings", "Storing SQL tables", "Storing image files", "Storing user passwords", "A"),
            ("What are 'Embeddings' in the context of AI?", "Numerical representations of text capturing meaning", "The text itself", "A type of database indexing", "A way to hide data", "A"),
            ("What is 'Chunking' in RAG?", "Splitting long documents into smaller segments for indexing", "Deleting old data", "Merging multiple models", "Translating documents", "A"),
            ("Which similarity metric is commonly used in Vector DBs?", "Cosine Similarity", "Linear Regression", "Standard Deviation", "Square Root", "A"),
            ("What is a 'Retriever' in a RAG system?", "The component that finds relevant context from the database", "The component that generates text", "The user asking a question", "The API gateway", "A"),
            ("What is 'Dense Retrieval'?", "Retrieval based on semantic embeddings", "Retrieval based on keyword matching", "Retrieval of large files", "Retrieval from local storage", "A"),
            ("What is 'Top-K' in retrieval?", "The number of most relevant documents to retrieve", "The quality score of the model", "The speed of the database", "The version of the retriever", "A"),
            ("What is 'Hybrid Search'?", "Combining keyword (BM25) and semantic search", "Searching two databases at once", "Searching on both CPU and GPU", "Searching using text and audio", "A"),

            # MCP (Model Context Protocol) 
            ("What is the 'Model Context Protocol' (MCP)?", "An open standard for connecting AI models to data/tools", "An open source protocol for model training", "A type of prompt engineering", "A security layer for LLMs", "A"),
            ("Who introduced the Model Context Protocol?", "Anthropic", "OpenAI", "Google", "Meta", "A"),
            ("What is the role of an 'MCP Server'?", "To provide data, tools, or resources to an LLM", "To execute the LLM inference", "To store model weights", "To manage user auth", "A"),
            ("What is an 'MCP Client'?", "The application that connects to and uses MCP servers", "The database backend", "The training dataset", "The end user's browser", "A"),
            ("Which of these is a core primitive in MCP?", "Resources", "Layers", "Weights", "Gradients", "A"),
            ("What are 'Tools' in MCP?", "Executable functions that models can call", "Physical hardware", "Software compilers", "Training scripts", "A"),
            ("What are 'Resources' in MCP?", "Data that models can read from a server", "RAM modules", "CPU cores", "API subscriptions", "A"),
            ("Can MCP servers run on a local machine?", "Yes", "No", "Only if connected via VPN", "Only in Docker containers", "A"),
            ("What format does MCP use for server/client communication?", "JSON-RPC", "XML", "Protobuf", "CSV", "A"),
            ("Does MCP allow LLMs to safely interact with local files?", "Yes, via specific server-defined boundaries", "No, it is for cloud files only", "Yes, it gives full unrestricted access", "No, it only allows read Access", "A"),

            # Mixed / Advanced AI
            ("What is 'PEFT'?", "Parameter-Efficient Fine-Tuning", "Primary Engine for Fast Training", "Private Encryption for Text", "Pre-calculated Embedding Factor", "A"),
            ("What is 'LoRA'?", "Low-Rank Adaptation of LLMs", "Long-Range AI", "Local Retrieval Algorithm", "Logic-based Reasoning Agent", "A"),
            ("What is 'Quantization' in LLMs?", "Reducing the precision of model weights to save memory", "Increasing the number of layers", "Sampling more tokens", "Improving model accuracy", "A"),
            ("What is 'In-context Learning'?", "The model learning from examples provided in the prompt", "The model training on new data", "The model surfing the web", "The model asking for feedback", "A"),
            ("What is the 'Stochastic Parrot' argument?", "The idea that LLMs only predict next tokens without understanding", "The idea that LLMs are sentient", "A type of data augmentation", "A new model architecture", "A"),
            ("What is 'DPO'?", "Direct Preference Optimization", "Data Privacy Office", "Distributed Power Output", "Dual Prompt Operation", "A"),
            ("What is 'Grokking' in neural networks?", "A phenomenon where a model suddenly masters a task after long training", "A new Google model", "A type of overfitting", "A way to compress models", "A"),
            ("What is 'MoE'?", "Mixture of Experts", "Master of Engineering", "Module of Everything", "Model of Empathy", "A"),
            ("Which company created the 'Gemini' models?", "Google", "OpenAI", "Anthropic", "Meta", "A"),
            ("What is 'Multimodality' in AI?", "The ability to process multiple types of data (text, image, audio)", "The ability to run on many servers", "Having multiple versions of a model", "Speaking many languages", "A")
        ]
        
        questions = [
            models.Question(
                text=q[0],
                option_a=q[1],
                option_b=q[2],
                option_c=q[3],
                option_d=q[4],
                correct_answer=q[5]
            ) for q in ai_questions
        ]
        db.bulk_save_objects(questions)
        db.commit()

        # Seed admin user
        from app.core.security import get_password_hash
        admin_user = db.query(models.User).filter(models.User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            new_admin = models.User(
                first_name="Admin",
                last_name="System",
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                is_active=True,
                is_admin=True
            )
            db.add(new_admin)
            db.commit()
    finally:
        db.close()

# Add Session Middleware for Admin Auth
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Setup Admin Panel
setup_admin(app)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(competition.router, prefix=f"{settings.API_V1_STR}/competitions", tags=["competitions"])
app.include_router(payment.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
app.include_router(submission.router, prefix=f"{settings.API_V1_STR}/submissions", tags=["submissions"])
app.include_router(quiz.router, prefix=f"{settings.API_V1_STR}/quiz", tags=["quiz"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Big Skill Challenge API"}
