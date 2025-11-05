from prisma import Prisma
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Global Prisma client instance
prisma_client = None


def get_prisma_client() -> Prisma:
    """
    Get the Prisma client instance.
    
    Returns:
        Prisma client instance
    """
    global prisma_client
    if prisma_client is None:
        prisma_client = Prisma()
    return prisma_client


async def connect_db():
    """
    Connect to the database.
    """
    prisma = get_prisma_client()
    await prisma.connect()
    logger.info("Connected to MongoDB")


async def disconnect_db():
    """
    Disconnect from the database.
    """
    prisma = get_prisma_client()
    await prisma.disconnect()
    logger.info("Disconnected from MongoDB")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI app to handle database connections.
    """
    await connect_db()
    yield
    await disconnect_db()

