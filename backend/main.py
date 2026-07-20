from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from schemas import TaskCreate, TaskUpdate, TaskResponse
from database import create_db_and_tables, engine
from models import Task


app = FastAPI(
    title="Task Manager API",
    description="REST API for managing tasks",
    version="1.0"
)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def home():
    return {"message": "Welcome to Task Manager API"}

@app.get(
    "/tasks",
    response_model=list[TaskResponse]
)
def get_all_tasks():

    with Session(engine) as session:
        statement = select(Task)
        tasks = session.exec(statement).all()

    return tasks

@app.get(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def get_task(task_id: int):

    with Session(engine) as session:
        task = session.get(Task, task_id)

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return task

@app.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_task(task: TaskCreate):

    new_task = Task(
        title=task.title,
        description=task.description,
        completed=task.completed
    )

    with Session(engine) as session:
        session.add(new_task)
        session.commit()
        session.refresh(new_task)

    return new_task

@app.patch(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def update_task(task_id: int, updated_task: TaskUpdate):

    with Session(engine) as session:

        task = session.get(Task, task_id)

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        update_data = updated_task.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(task, key, value)

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

@app.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_task(task_id: int):

    with Session(engine) as session:

        task = session.get(Task, task_id)

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        session.delete(task)
        session.commit()

        return