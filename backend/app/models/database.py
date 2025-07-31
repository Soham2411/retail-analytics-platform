from sqlalchemy import create_engine, Column, String, Integer, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
from dotenv import load_dotenv

# ✅ FIX: Only load .env in development, not in production
if os.path.exists('.env'):
    load_dotenv()

# ✅ FIX: Get DATABASE_URL directly from environment (works on Render)
DATABASE_URL = os.getenv("DATABASE_URL")

# ✅ FIX: Add error handling for missing DATABASE_URL
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    
    product_id = Column(String, primary_key=True)
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    
    # Relationship to orders
    orders = relationship("Order", back_populates="product")

class Customer(Base):
    __tablename__ = "customers"
    
    customer_id = Column(String, primary_key=True)
    customer_name = Column(String, nullable=False)
    segment = Column(String, nullable=False)
    country = Column(String)
    city = Column(String)
    state = Column(String)
    region = Column(String)
    
    # Relationship to orders
    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"
    
    row_id = Column(Integer, primary_key=True)
    order_id = Column(String, nullable=False)
    order_date = Column(Date, nullable=False)
    ship_date = Column(Date)
    ship_mode = Column(String)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    product_id = Column(String, ForeignKey("products.product_id"))
    sales = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    discount = Column(Float, default=0)
    profit = Column(Float, nullable=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="orders")
    product = relationship("Product", back_populates="orders")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()