from pymongo import MongoClient
from app.core.config import settings

# Ek hi shared client — poori app mein reuse hoga, baar-baar connect nahi karna padega.
_client = MongoClient(settings.mongo_uri)
_db = _client[settings.mongo_db_name]

note_chunks_collection = _db["note_chunks"]