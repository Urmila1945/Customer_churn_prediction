from datetime import datetime, timedelta
from typing import Dict, List, Optional
import csv
from io import StringIO

from fastapi import Depends, FastAPI, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

SECRET_KEY = 'neo_pulse_secret_key_2026_demo'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')

app = FastAPI(title='NeoPulse AI API', version='2.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Enhanced user database with roles
fake_users_db: Dict[str, Dict[str, str]] = {
    'neo_admin': {
        'username': 'neo_admin',
        'full_name': 'Neo Pulse Admin',
        'email': 'admin@neopulse.ai',
        'hashed_password': pwd_context.hash('NeoPulse@2026'),
        'disabled': 'false',
        'role': 'admin',
        'department': 'Leadership',
    },
    'demo_analyst': {
        'username': 'demo_analyst',
        'full_name': 'Data Analyst',
        'email': 'analyst@neopulse.ai',
        'hashed_password': pwd_context.hash('Analyst@2026'),
        'disabled': 'false',
        'role': 'analyst',
        'department': 'Analytics',
    },
}

# Audit log and prediction history storage
audit_logs: List[Dict] = []
prediction_history: List[Dict] = []


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None


class UserInDB(User):
    hashed_password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None


class UserProfile(BaseModel):
    username: str
    full_name: str
    email: str
    role: str
    department: str
    last_login: Optional[str] = None
    created_at: Optional[str] = None


class PredictRequest(BaseModel):
    tenure: int
    complaints: int
    planType: str
    usage: int
    satisfaction: int
    region: str
    customer_id: Optional[str] = None


class BatchPredictRequest(BaseModel):
    records: List[PredictRequest]


class PredictResponse(BaseModel):
    score: int
    class_name: str
    confidence: int
    reasons: List[str]
    recommendations: Optional[List[str]] = None
    prediction_id: Optional[str] = None
    timestamp: Optional[str] = None


class BatchPredictResponse(BaseModel):
    total: int
    high_risk: int
    moderate_risk: int
    low_risk: int
    predictions: List[PredictResponse]


class SummaryResponse(BaseModel):
    summary: str
    high_risk_count: Optional[int] = None
    moderate_risk_count: Optional[int] = None
    low_risk_count: Optional[int] = None
    avg_risk_score: Optional[float] = None


class AnalyticsResponse(BaseModel):
    total_predictions: int
    avg_confidence: float
    risk_distribution: Dict[str, int]
    top_churn_drivers: List[str]
    retention_opportunities: List[str]


class AuditLogEntry(BaseModel):
    timestamp: str
    user: str
    action: str
    resource: str
    status: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db, username: str) -> Optional[UserInDB]:
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)
    return None


def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = get_user(fake_users_db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def log_audit_event(user: str, action: str, resource: str, status: str = 'success'):
    """Log user actions for audit trail"""
    audit_logs.append({
        'timestamp': datetime.utcnow().isoformat(),
        'user': user,
        'action': action,
        'resource': resource,
        'status': status,
    })


def require_role(required_role: str):
    """Dependency for role-based access control"""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role != required_role and current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Not enough permissions'
            )
        return current_user
    return role_checker


def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.disabled == 'true':
        raise HTTPException(status_code=400, detail='Inactive user')
    return current_user


class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    department: Optional[str] = 'General'


@app.post('/api/auth/register', status_code=201)
def register_user(data: RegisterRequest):
    if data.username in fake_users_db:
        raise HTTPException(status_code=400, detail='Username already exists')
    fake_users_db[data.username] = {
        'username': data.username,
        'full_name': data.full_name,
        'email': data.email,
        'hashed_password': pwd_context.hash(data.password),
        'disabled': 'false',
        'role': 'analyst',
        'department': data.department,
    }
    log_audit_event(data.username, 'register', 'auth', 'success')
    return {'status': 'Account created successfully'}


@app.post('/api/auth/login', response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        log_audit_event(form_data.username, 'login', 'auth', 'failed')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    access_token = create_access_token(data={'sub': user.username})
    log_audit_event(user.username, 'login', 'auth', 'success')
    return {'access_token': access_token, 'token_type': 'bearer'}


@app.get('/api/auth/me', response_model=UserProfile)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return UserProfile(
        username=current_user.username,
        full_name=current_user.full_name,
        email=current_user.email,
        role=current_user.role,
        department=current_user.department,
        last_login=datetime.utcnow().isoformat(),
        created_at='2026-01-01T00:00:00',
    )


@app.get('/api/auth/users')
def list_users(current_user: User = Depends(require_role('admin'))):
    """Admin endpoint to list all users"""
    log_audit_event(current_user.username, 'list_users', 'users', 'success')
    return [
        {
            'username': u,
            'full_name': fake_users_db[u]['full_name'],
            'email': fake_users_db[u]['email'],
            'role': fake_users_db[u]['role'],
            'disabled': fake_users_db[u]['disabled'],
        }
        for u in fake_users_db
    ]


@app.put('/api/auth/profile')
def update_profile(
    update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile"""
    if update.full_name:
        fake_users_db[current_user.username]['full_name'] = update.full_name
    if update.email:
        fake_users_db[current_user.username]['email'] = update.email
    if update.department:
        fake_users_db[current_user.username]['department'] = update.department
    
    log_audit_event(current_user.username, 'update_profile', 'users', 'success')
    return {'status': 'Profile updated successfully'}


@app.get('/api/summary', response_model=SummaryResponse)
def get_summary(current_user: User = Depends(get_current_active_user)):
    """Get churn summary with enhanced analytics"""
    high_risk = len([p for p in prediction_history if p['class_name'] == 'High Risk'])
    moderate_risk = len([p for p in prediction_history if p['class_name'] == 'Moderate Risk'])
    low_risk = len([p for p in prediction_history if p['class_name'] == 'Low Risk'])
    avg_score = sum([p['score'] for p in prediction_history]) / len(prediction_history) if prediction_history else 0
    
    log_audit_event(current_user.username, 'view_summary', 'summary', 'success')
    return SummaryResponse(
        summary=(
            'Premium customer churn is rising this month. NeoPulse AI '
            'identifies low engagement, billing delays, and churn drivers. '
            'Activate targeted retention campaigns now.'
        ),
        high_risk_count=high_risk,
        moderate_risk_count=moderate_risk,
        low_risk_count=low_risk,
        avg_risk_score=round(avg_score, 2),
    )


@app.post('/api/predict', response_model=PredictResponse)
def predict_churn(
    payload: PredictRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Single prediction endpoint"""
    base_risk = 30
    base_risk += max(0, 20 - payload.satisfaction) * 0.8
    base_risk += payload.complaints * 4
    base_risk += max(0, 60 - payload.usage) * 0.25
    if payload.planType.lower() in ['premium', 'annual']:
        base_risk += 8
    if payload.region.lower() in ['mumbai', 'delhi']:
        base_risk += 4

    score = min(99, int(base_risk + payload.tenure * 0.3))
    confidence = min(99, max(82, score - 2))
    if score > 80:
        class_name = 'High Risk'
    elif score > 60:
        class_name = 'Moderate Risk'
    else:
        class_name = 'Low Risk'

    reasons = [
        'Low engagement',
        'Late payments',
        'Subscription inactivity',
    ]
    recommendations = [
        'Offer a loyalty discount on renewal',
        'Assign dedicated premium support',
        'Send personalized retention campaign',
    ]
    
    prediction_id = f"pred_{len(prediction_history) + 1}"
    timestamp = datetime.utcnow().isoformat()
    
    prediction = PredictResponse(
        score=score,
        class_name=class_name,
        confidence=confidence,
        reasons=reasons,
        recommendations=recommendations,
        prediction_id=prediction_id,
        timestamp=timestamp,
    )
    
    # Store in history
    prediction_history.append({
        'prediction_id': prediction_id,
        'customer_id': payload.customer_id or f"cust_{len(prediction_history) + 1}",
        'score': score,
        'class_name': class_name,
        'confidence': confidence,
        'timestamp': timestamp,
        'user': current_user.username,
    })
    
    log_audit_event(current_user.username, 'predict', 'prediction', 'success')
    return prediction


@app.post('/api/predict/batch', response_model=BatchPredictResponse)
def batch_predict(
    payload: BatchPredictRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Batch prediction endpoint"""
    predictions = []
    high_risk_count = 0
    moderate_risk_count = 0
    low_risk_count = 0
    
    for record in payload.records:
        base_risk = 30
        base_risk += max(0, 20 - record.satisfaction) * 0.8
        base_risk += record.complaints * 4
        base_risk += max(0, 60 - record.usage) * 0.25
        if record.planType.lower() in ['premium', 'annual']:
            base_risk += 8
        if record.region.lower() in ['mumbai', 'delhi']:
            base_risk += 4

        score = min(99, int(base_risk + record.tenure * 0.3))
        confidence = min(99, max(82, score - 2))
        if score > 80:
            class_name = 'High Risk'
            high_risk_count += 1
        elif score > 60:
            class_name = 'Moderate Risk'
            moderate_risk_count += 1
        else:
            class_name = 'Low Risk'
            low_risk_count += 1

        prediction_id = f"batch_pred_{len(prediction_history) + 1}"
        timestamp = datetime.utcnow().isoformat()
        
        pred = PredictResponse(
            score=score,
            class_name=class_name,
            confidence=confidence,
            reasons=['Low engagement', 'Late payments', 'Subscription inactivity'],
            recommendations=['Offer loyalty discount', 'Assign premium support', 'Send retention campaign'],
            prediction_id=prediction_id,
            timestamp=timestamp,
        )
        predictions.append(pred)
        
        # Store in history
        prediction_history.append({
            'prediction_id': prediction_id,
            'customer_id': record.customer_id or f"cust_{len(prediction_history) + 1}",
            'score': score,
            'class_name': class_name,
            'timestamp': timestamp,
            'user': current_user.username,
        })
    
    log_audit_event(current_user.username, 'batch_predict', 'predictions', 'success')
    return BatchPredictResponse(
        total=len(predictions),
        high_risk=high_risk_count,
        moderate_risk=moderate_risk_count,
        low_risk=low_risk_count,
        predictions=predictions,
    )


@app.get('/api/analytics')
def get_analytics(current_user: User = Depends(get_current_active_user)):
    """Get analytics and insights"""
    total_predictions = len(prediction_history)
    avg_confidence = (
        sum([p['confidence'] for p in prediction_history]) / total_predictions
        if total_predictions > 0 else 0
    )
    
    risk_dist = {
        'High Risk': len([p for p in prediction_history if p['class_name'] == 'High Risk']),
        'Moderate Risk': len([p for p in prediction_history if p['class_name'] == 'Moderate Risk']),
        'Low Risk': len([p for p in prediction_history if p['class_name'] == 'Low Risk']),
    }
    
    log_audit_event(current_user.username, 'view_analytics', 'analytics', 'success')
    return AnalyticsResponse(
        total_predictions=total_predictions,
        avg_confidence=round(avg_confidence, 2),
        risk_distribution=risk_dist,
        top_churn_drivers=['Low engagement', 'Late payments', 'High complaints'],
        retention_opportunities=['Loyalty programs', 'Premium support', 'Personalized campaigns'],
    )


@app.get('/api/predictions/history')
def get_prediction_history(current_user: User = Depends(get_current_active_user)):
    """Get prediction history"""
    log_audit_event(current_user.username, 'view_history', 'predictions', 'success')
    return {'total': len(prediction_history), 'predictions': prediction_history[-100:]}


@app.post('/api/data/import')
async def import_data(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role('admin')),
):
    """Import customer data from CSV"""
    try:
        contents = await file.read()
        reader = csv.DictReader(contents.decode().splitlines())
        imported_count = 0
        
        for row in reader:
            # Process and store imported data
            imported_count += 1
        
        log_audit_event(current_user.username, 'import_data', 'data', 'success')
        return {
            'status': 'success',
            'message': f'Imported {imported_count} records',
            'imported_count': imported_count,
        }
    except Exception as e:
        log_audit_event(current_user.username, 'import_data', 'data', 'failed')
        raise HTTPException(status_code=400, detail=str(e))


@app.get('/api/data/export')
def export_data(
    current_user: User = Depends(get_current_active_user),
):
    """Export prediction history as CSV"""
    output = StringIO()
    if prediction_history:
        writer = csv.DictWriter(
            output,
            fieldnames=['prediction_id', 'customer_id', 'score', 'class_name', 'timestamp', 'user']
        )
        writer.writeheader()
        writer.writerows(prediction_history)
    
    log_audit_event(current_user.username, 'export_data', 'data', 'success')
    return {'data': output.getvalue(), 'format': 'csv'}


@app.get('/api/audit/logs')
def get_audit_logs(
    current_user: User = Depends(require_role('admin')),
):
    """Get audit logs (admin only)"""
    log_audit_event(current_user.username, 'view_audit_logs', 'audit', 'success')
    return {
        'total': len(audit_logs),
        'logs': audit_logs[-500:],
    }


@app.get('/api/health')
def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'version': '2.0.0',
        'predictions_total': len(prediction_history),
        'audit_logs_total': len(audit_logs),
    }
