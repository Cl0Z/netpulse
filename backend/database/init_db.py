from database.connection import engine, Base
from models.metrics import (
    Node,
    SystemMetric,
    NetworkMetric,
    NetworkHealth,
)


Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")
