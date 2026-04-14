from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from app.models import User, Competition, Entry, Score, Question, QuizAttempt
from app.database import engine, SessionLocal
from app.core.security import verify_password
from app.core.config import settings
import os

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username, password = form.get("username"), form.get("password")

        # Basic Admin Authentication: check for matching user with is_admin=True
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == username, User.is_admin == True).first()
            if user and verify_password(password, user.hashed_password):
                request.session.update({"token": "admin-session-active"})
                return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            return False
        return True

authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.first_name, User.last_name, User.is_active, User.is_admin]
    column_searchable_list = [User.email, User.first_name, User.last_name]
    name_plural = "Users"
    icon = "fa-solid fa-user"

class CompetitionAdmin(ModelView, model=Competition):
    column_list = [Competition.id, Competition.title, Competition.entry_fee, Competition.is_active]
    name_plural = "Competitions"
    icon = "fa-solid fa-trophy"

class EntryAdmin(ModelView, model=Entry):
    column_list = [Entry.id, Entry.user_id, Entry.competition_id, Entry.status, Entry.is_shortlisted, Entry.is_winner, Entry.created_at]
    column_details_list = [Entry.id, Entry.user_id, Entry.competition_id, Entry.content, Entry.status, Entry.is_shortlisted, Entry.is_winner, Entry.created_at]
    name_plural = "Entries"
    icon = "fa-solid fa-file-pen"
    can_edit = True
    can_create = False

    def get_list_query(self, request):
        from sqlalchemy import select, desc
        from app.models import Score
        
        # Select the entry with the highest score per user.
        # If scores are tied, use the most recent entry (Order by total_score DESC, created_at DESC).
        # We use DISTINCT ON (user_id) for PostgreSQL efficiency and clarity.
        query = (
            select(Entry)
            .join(Score, Entry.id == Score.entry_id)
            .distinct(Entry.user_id)
            .order_by(Entry.user_id, desc(Score.total_score), desc(Entry.created_at))
        )
        return query

    def get_count_query(self, request):
        from sqlalchemy import select, func
        from app.models import Score
        # Count of unique users who have scored entries
        query = select(func.count(func.distinct(Entry.user_id))).join(Score, Entry.id == Score.entry_id)
        return query

class ScoreAdmin(ModelView, model=Score):
    column_list = [Score.id, Score.entry_id, Score.total_score, Score.relevance_score, Score.creativity_score]
    column_default_sort = [(Score.total_score, True)]  # Show top scores first
    name_plural = "Leaderboard" # Renaming Score to Leaderboard as requested
    icon = "fa-solid fa-ranking-star"

class QuestionAdmin(ModelView, model=Question):
    column_list = [Question.id, Question.text, Question.correct_answer]
    name_plural = "Quiz Questions"
    icon = "fa-solid fa-question"

class QuizAttemptAdmin(ModelView, model=QuizAttempt):
    column_list = [QuizAttempt.id, QuizAttempt.user_id, QuizAttempt.score, QuizAttempt.status]
    name_plural = "Quiz Attempts"
    icon = "fa-solid fa-clipboard-check"
    can_create = False

def setup_admin(app):
    admin = Admin(app, engine, authentication_backend=authentication_backend)
    admin.add_view(UserAdmin)
    admin.add_view(CompetitionAdmin)
    admin.add_view(QuestionAdmin)
    admin.add_view(QuizAttemptAdmin)
    admin.add_view(EntryAdmin)
    admin.add_view(ScoreAdmin)
    return admin
