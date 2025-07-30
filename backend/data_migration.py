import pandas as pd
import psycopg2
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_superstore_data():
    """Migrate Superstore CSV data to PostgreSQL"""
    
    # Database connection
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    
    print("🔄 Loading Superstore CSV data...")
    # Load your CSV file
    df = pd.read_csv('../data/Sample - Superstore.csv', encoding='latin-1')
    
    print(f"📊 Loaded {len(df)} rows of data")
    print("📋 Columns:", list(df.columns))
    print("📝 Sample data:")
    print(df.head())
    
    # Clean and prepare data
    df['Order Date'] = pd.to_datetime(df['Order Date'])
    df['Ship Date'] = pd.to_datetime(df['Ship Date'])
    
    # Create products dataframe
    products_df = df[['Product ID', 'Category', 'Sub-Category', 'Product Name']].drop_duplicates()
    products_df.columns = ['product_id', 'category', 'sub_category', 'product_name']
    
    # Create customers dataframe
    customers_df = df[['Customer ID', 'Customer Name', 'Segment', 'Country', 'City', 'State', 'Region']].drop_duplicates()
    customers_df.columns = ['customer_id', 'customer_name', 'segment', 'country', 'city', 'state', 'region']
    
    # Create orders dataframe
    orders_df = df[['Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode', 
                   'Customer ID', 'Product ID', 'Sales', 'Quantity', 'Discount', 'Profit']].copy()
    orders_df.columns = ['row_id', 'order_id', 'order_date', 'ship_date', 'ship_mode',
                        'customer_id', 'product_id', 'sales', 'quantity', 'discount', 'profit']
    
    # Insert data with error handling
    try:
        print("📦 Inserting products...")
        products_df.to_sql('products', engine, if_exists='replace', index=False)
        print(f"✅ Inserted {len(products_df)} products")
        
        print("👥 Inserting customers...")
        customers_df.to_sql('customers', engine, if_exists='replace', index=False)
        print(f"✅ Inserted {len(customers_df)} customers")
        
        print("🛒 Inserting orders...")
        orders_df.to_sql('orders', engine, if_exists='replace', index=False, method='multi')
        print(f"✅ Inserted {len(orders_df)} orders")
        
        print("🎉 Data migration completed successfully!")
        
        # Verify data
        # with engine.connect() as conn:
        #    result = conn.execute("SELECT COUNT(*) FROM orders")
        #   count = result.fetchone()[0]
        #  print(f"🎯 Total orders in database: {count}")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")

if __name__ == "__main__":
    migrate_superstore_data()
