from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    initials: str
    avatar_color: str
    emotion: Optional[str] = "neutral"
    hope_points: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: str
    emotion: Optional[str] = "neutral"

class Charity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    charity_type: str  # "children", "animals", "education"
    goal: float
    current_amount: float = 0.0
    visual_type: str  # "tree", "butterfly", "books"

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    charity_id: str
    amount: float
    ripple_color: str
    ripple_size: float
    status: str = "pending"  # "pending", "completed", "failed"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DonationCreate(BaseModel):
    user_id: str
    charity_id: str
    amount: float

class PaymentRequest(BaseModel):
    donation_id: str
    amount: float
    upi_id: Optional[str] = "hopeorb@upi"

class PaymentResponse(BaseModel):
    upi_link: str
    qr_data: str
    payment_id: str

class PaymentVerify(BaseModel):
    donation_id: str
    payment_id: str

class AudioMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    donation_id: str
    audio_data: str  # base64 encoded
    duration: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AudioMessageCreate(BaseModel):
    user_id: str
    donation_id: str
    audio_data: str
    duration: float

class LeaderboardEntry(BaseModel):
    user_id: str
    name: str
    weekly_donations: int
    consistency_score: int
    hope_points: int

# Helper Functions
def get_avatar_color(name: str) -> str:
    """Generate consistent color based on name"""
    colors = [
        "#FF6B9D", "#C44569", "#FFC312", "#F79F1F",
        "#12CBC4", "#0652DD", "#9980FA", "#FDA7DF",
        "#ED4C67", "#B53471", "#EE5A6F", "#5F27CD"
    ]
    return colors[hash(name) % len(colors)]

def get_initials(name: str) -> str:
    """Get initials from name"""
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper()

def calculate_ripple_properties(amount: float) -> dict:
    """Calculate ripple size and color based on donation amount"""
    # Size: 1-10 scale
    ripple_size = min(10, max(1, amount / 10))
    
    # Color based on amount ranges
    if amount < 50:
        color = "#4ECDC4"  # Turquoise
    elif amount < 100:
        color = "#FFD93D"  # Golden
    elif amount < 500:
        color = "#FF6B9D"  # Pink
    else:
        color = "#9D4EDD"  # Purple
    
    return {"size": ripple_size, "color": color}

# API Routes
@api_router.post("/register", response_model=User)
async def register_user(user_input: UserCreate):
    """Register a new user"""
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_input.email})
    if existing_user:
        existing_user['_id'] = str(existing_user['_id'])
        if isinstance(existing_user['created_at'], str):
            existing_user['created_at'] = datetime.fromisoformat(existing_user['created_at'])
        return User(**existing_user)
    
    user = User(
        name=user_input.name,
        email=user_input.email,
        initials=get_initials(user_input.name),
        avatar_color=get_avatar_color(user_input.name),
        emotion=user_input.emotion or "neutral"
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    return user

@api_router.get("/user/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

@api_router.post("/donate", response_model=Donation)
async def create_donation(donation_input: DonationCreate):
    """Create a new donation"""
    ripple_props = calculate_ripple_properties(donation_input.amount)
    
    donation = Donation(
        user_id=donation_input.user_id,
        charity_id=donation_input.charity_id,
        amount=donation_input.amount,
        ripple_color=ripple_props["color"],
        ripple_size=ripple_props["size"],
        status="pending"
    )
    
    doc = donation.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.donations.insert_one(doc)
    
    return donation

@api_router.get("/donations", response_model=List[Donation])
async def get_donations(limit: int = 100):
    """Get recent donations for ripple visualization"""
    donations = await db.donations.find(
        {"status": "completed"}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    for donation in donations:
        if isinstance(donation['timestamp'], str):
            donation['timestamp'] = datetime.fromisoformat(donation['timestamp'])
    
    return donations

@api_router.post("/payment/generate-upi", response_model=PaymentResponse)
async def generate_upi_payment(payment_req: PaymentRequest):
    """Generate UPI payment link (MOCKED)"""
    payment_id = str(uuid.uuid4())
    
    # Create UPI payment link (standard UPI format)
    upi_link = f"upi://pay?pa={payment_req.upi_id}&pn=HopeOrb&am={payment_req.amount}&cu=INR&tn=Donation%20{payment_req.donation_id}"
    
    # QR data is the same as UPI link
    qr_data = upi_link
    
    return PaymentResponse(
        upi_link=upi_link,
        qr_data=qr_data,
        payment_id=payment_id
    )

@api_router.post("/payment/verify")
async def verify_payment(verify_req: PaymentVerify):
    """Verify payment (MOCKED - always succeeds after 2 seconds)"""
    # In real implementation, this would check with payment gateway
    # For now, we'll update the donation status to completed
    
    donation = await db.donations.find_one({"id": verify_req.donation_id})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    # Update donation status
    await db.donations.update_one(
        {"id": verify_req.donation_id},
        {"$set": {"status": "completed"}}
    )
    
    # Update charity amount
    await db.charities.update_one(
        {"id": donation["charity_id"]},
        {"$inc": {"current_amount": donation["amount"]}}
    )
    
    # Award hope points to user (1 point per 10 rupees)
    hope_points = int(donation["amount"] / 10)
    await db.users.update_one(
        {"id": donation["user_id"]},
        {"$inc": {"hope_points": hope_points}}
    )
    
    return {"success": True, "message": "Payment verified successfully"}

@api_router.post("/audio-message", response_model=AudioMessage)
async def create_audio_message(audio_input: AudioMessageCreate):
    """Save audio message"""
    audio_msg = AudioMessage(
        user_id=audio_input.user_id,
        donation_id=audio_input.donation_id,
        audio_data=audio_input.audio_data,
        duration=audio_input.duration
    )
    
    doc = audio_msg.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.audio_messages.insert_one(doc)
    
    return audio_msg

@api_router.get("/audio-message/{donation_id}")
async def get_audio_message(donation_id: str):
    """Get audio message by donation ID"""
    audio = await db.audio_messages.find_one({"donation_id": donation_id}, {"_id": 0})
    if not audio:
        return None
    
    if isinstance(audio.get('created_at'), str):
        audio['created_at'] = datetime.fromisoformat(audio['created_at'])
    
    return audio

@api_router.get("/charities", response_model=List[Charity])
async def get_charities():
    """Get all charities"""
    charities = await db.charities.find({}, {"_id": 0}).to_list(1000)
    return charities

@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 10):
    """Get leaderboard based on consistency"""
    # Get users with most donations this week
    week_ago = datetime.now(timezone.utc).timestamp() - (7 * 24 * 60 * 60)
    
    pipeline = [
        {
            "$match": {"status": "completed"}
        },
        {
            "$group": {
                "_id": "$user_id",
                "weekly_donations": {"$sum": 1},
                "total_amount": {"$sum": "$amount"}
            }
        },
        {"$sort": {"weekly_donations": -1}},
        {"$limit": limit}
    ]
    
    results = await db.donations.aggregate(pipeline).to_list(limit)
    
    leaderboard = []
    for result in results:
        user = await db.users.find_one({"id": result["_id"]}, {"_id": 0})
        if user:
            leaderboard.append(LeaderboardEntry(
                user_id=user["id"],
                name=user["name"],
                weekly_donations=result["weekly_donations"],
                consistency_score=result["weekly_donations"] * 10,
                hope_points=user.get("hope_points", 0)
            ))
    
    return leaderboard

@api_router.get("/user/{user_id}/timeline")
async def get_user_timeline(user_id: str):
    """Get user's donation timeline"""
    donations = await db.donations.find(
        {"user_id": user_id, "status": "completed"},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    
    timeline = []
    for donation in donations:
        charity = await db.charities.find_one({"id": donation["charity_id"]}, {"_id": 0})
        if charity:
            timeline.append({
                "donation_id": donation["id"],
                "amount": donation["amount"],
                "charity_name": charity["name"],
                "charity_type": charity["charity_type"],
                "visual_type": charity["visual_type"],
                "timestamp": donation["timestamp"]
            })
    
    return timeline

# Initialize default charities
@api_router.post("/init-charities")
async def initialize_charities():
    """Initialize default charities (call once)"""
    existing = await db.charities.count_documents({})
    if existing > 0:
        return {"message": "Charities already initialized"}
    
    charities = [
        Charity(
            name="Children's Future Fund",
            description="Supporting education and healthcare for underprivileged children",
            charity_type="children",
            goal=100000.0,
            visual_type="tree"
        ),
        Charity(
            name="Wildlife Protection",
            description="Protecting endangered species and their habitats",
            charity_type="animals",
            goal=75000.0,
            visual_type="butterfly"
        ),
        Charity(
            name="Education For All",
            description="Providing books and educational resources to rural schools",
            charity_type="education",
            goal=50000.0,
            visual_type="books"
        )
    ]
    
    for charity in charities:
        await db.charities.insert_one(charity.model_dump())
    
    return {"message": "Charities initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()