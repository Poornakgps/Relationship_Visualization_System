#!/usr/bin/env python3
import random
import requests
import json
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()

BASE_URL = "http://localhost:3000/api"
HEADERS = {"Content-Type": "application/json"}

CURRENCIES = ["INR"]
PAYMENT_METHODS = ["credit_card", "debit_card", "bank_transfer", "paypal", "apple_pay", "google_pay", "crypto", "cash"]
TRANSACTION_DESCRIPTIONS = [
    "Online purchase", "Grocery shopping", "Restaurant payment", "Gas station",
    "ATM withdrawal", "Salary deposit", "Rent payment", "Utility bill",
    "Insurance payment", "Investment", "Gift transfer", "Refund", "Subscription"
]

IP_POOLS = [
    "192.168.1.10", "192.168.1.20", "192.168.1.30", "10.0.0.5", "10.0.0.15",
    "172.16.1.100", "172.16.1.200", "203.0.113.1", "203.0.113.50"
]

DEVICE_POOLS = [
    "device_001", "device_002", "device_003", "device_004", "device_005",
    "mobile_app_001", "mobile_app_002", "web_browser_001", "web_browser_002"
]

class TestDataGenerator:
    def __init__(self):
        self.created_users = []
        self.created_transactions = []
    
    def generate_user_data(self, force_shared_attributes=False):
        """Generate realistic user data"""
        if force_shared_attributes and self.created_users:
            existing_user = random.choice(self.created_users)
            
            user_data = {
                "email": existing_user["email"] if random.random() < 0.3 else fake.email(),
                "phone": existing_user["phone"] if random.random() < 0.3 else fake.phone_number()[:15],
                "firstName": fake.first_name(),
                "lastName": fake.last_name(),
                "address": existing_user["address"] if random.random() < 0.2 else fake.address().replace('\n', ', ')[:100],
                "dateOfBirth": fake.date_of_birth(minimum_age=18, maximum_age=80).strftime("%Y-%m-%d")
            }
        else:
            user_data = {
                "email": fake.email(),
                "phone": fake.phone_number()[:15],
                "firstName": fake.first_name(),
                "lastName": fake.last_name(),
                "address": fake.address().replace('\n', ', ')[:100],
                "dateOfBirth": fake.date_of_birth(minimum_age=18, maximum_age=80).strftime("%Y-%m-%d")
            }
        
        return user_data
    
    def generate_transaction_data(self, sender_id, recipient_id, force_shared_attributes=False):
        """Generate realistic transaction data"""
        
        if force_shared_attributes and self.created_transactions:
            existing_transaction = random.choice(self.created_transactions)
            
            transaction_data = {
                "senderId": sender_id,
                "recipientId": recipient_id,
                "amount": round(random.uniform(1.0, 10000.0), 2),
                "currency": random.choice(CURRENCIES),
                "description": random.choice(TRANSACTION_DESCRIPTIONS),
                "ipAddress": existing_transaction.get("ipAddress", random.choice(IP_POOLS)) if random.random() < 0.4 else random.choice(IP_POOLS),
                "deviceId": existing_transaction.get("deviceId", random.choice(DEVICE_POOLS)) if random.random() < 0.4 else random.choice(DEVICE_POOLS),
                "paymentMethod": existing_transaction.get("paymentMethod", random.choice(PAYMENT_METHODS)) if random.random() < 0.3 else random.choice(PAYMENT_METHODS)
            }
        else:
            transaction_data = {
                "senderId": sender_id,
                "recipientId": recipient_id,
                "amount": round(random.uniform(1.0, 10000.0), 2),
                "currency": random.choice(CURRENCIES),
                "description": random.choice(TRANSACTION_DESCRIPTIONS),
                "ipAddress": random.choice(IP_POOLS),
                "deviceId": random.choice(DEVICE_POOLS),
                "paymentMethod": random.choice(PAYMENT_METHODS)
            }
        
        return transaction_data
    
    def create_user(self, user_data):
        """Create user via API"""
        try:
            response = requests.post(f"{BASE_URL}/users", json=user_data, headers=HEADERS)
            if response.status_code == 201:
                user = response.json()
                self.created_users.append({**user_data, "id": user.get("id")})
                print(f"✅ Created user: {user_data['firstName']} {user_data['lastName']} (ID: {user.get('id')})")
                return user
            else:
                print(f"❌ Failed to create user: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None
    
    def create_transaction(self, transaction_data):
        """Create transaction via API"""
        try:
            response = requests.post(f"{BASE_URL}/transactions", json=transaction_data, headers=HEADERS)
            if response.status_code == 201:
                transaction = response.json()
                self.created_transactions.append({**transaction_data, "id": transaction.get("id")})
                print(f"✅ Created transaction: ${transaction_data['amount']} {transaction_data['currency']} (ID: {transaction.get('id')})")
                return transaction
            else:
                print(f"❌ Failed to create transaction: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating transaction: {e}")
            return None
    
    def generate_test_scenario(self, num_users=10, num_transactions=20):
        """Generate a complete test scenario"""
        print("🚀 Starting Test Data Generation...")
        print(f"📊 Generating {num_users} users and {num_transactions} transactions\n")
        
        print("👥 Creating Users...")
        for i in range(num_users):
            force_shared = i > 2 and random.random() < 0.3
            user_data = self.generate_user_data(force_shared_attributes=force_shared)
            self.create_user(user_data)
        
        print(f"\n💰 Creating Transactions...")
        if len(self.created_users) < 2:
            print("❌ Need at least 2 users to create transactions")
            return
        
        for i in range(num_transactions):
            sender = random.choice(self.created_users)
            recipient = random.choice([u for u in self.created_users if u["id"] != sender["id"]])
            
            force_shared = i > 2 and random.random() < 0.4
            transaction_data = self.generate_transaction_data(
                sender["id"], 
                recipient["id"], 
                force_shared_attributes=force_shared
            )
            self.create_transaction(transaction_data)
        
        print(f"\n📈 Summary:")
        print(f"   • Created {len(self.created_users)} users")
        print(f"   • Created {len(self.created_transactions)} transactions")
        print(f"   • API Base URL: {BASE_URL}")
        print(f"   • Swagger UI: http://localhost:8080/swagger-ui.html")
        print(f"   • Neo4j Browser: http://localhost:7474")
    
    def generate_relationship_focused_data(self):
        """Generate data specifically to test relationships"""
        print("🔗 Generating Relationship-Focused Test Data...\n")
        
        shared_email = fake.email()
        for i in range(3):
            user_data = self.generate_user_data()
            user_data["email"] = shared_email
            self.create_user(user_data)
        
        shared_phone = fake.phone_number()[:15]
        for i in range(2):
            user_data = self.generate_user_data()
            user_data["phone"] = shared_phone
            self.create_user(user_data)
        
        shared_address = fake.address().replace('\n', ', ')[:100]
        for i in range(2):
            user_data = self.generate_user_data()
            user_data["address"] = shared_address
            self.create_user(user_data)
        
        if len(self.created_users) >= 4:
            users = self.created_users[-4:]
            
            same_device = "shared_device_001"
            for i in range(3):
                sender = users[i % len(users)]
                recipient = users[(i + 1) % len(users)]
                transaction_data = self.generate_transaction_data(sender["id"], recipient["id"])
                transaction_data["deviceId"] = same_device
                self.create_transaction(transaction_data)
            
            same_ip = "192.168.100.50"
            for i in range(2):
                sender = users[i % len(users)]
                recipient = users[(i + 2) % len(users)]
                transaction_data = self.generate_transaction_data(sender["id"], recipient["id"])
                transaction_data["ipAddress"] = same_ip
                self.create_transaction(transaction_data)
            
            same_payment = "shared_crypto_wallet"
            for i in range(2):
                sender = users[i % len(users)]
                recipient = users[(i + 1) % len(users)]
                transaction_data = self.generate_transaction_data(sender["id"], recipient["id"])
                transaction_data["paymentMethod"] = same_payment
                self.create_transaction(transaction_data)
    
    def test_all_endpoints(self):
        """Test all API endpoints"""
        print("🧪 Testing All API Endpoints...\n")
        
        try:
            response = requests.get(f"{BASE_URL}/users")
            print(f"GET /users: {response.status_code} - Found {len(response.json())} users")
            
            response = requests.get(f"{BASE_URL}/transactions")
            print(f"GET /transactions: {response.status_code} - Found {len(response.json())} transactions")
            
            if self.created_users:
                user_id = self.created_users[0]["id"]
                
                # Test GET user by ID
                response = requests.get(f"{BASE_URL}/users/{user_id}")
                print(f"GET /users/{user_id}: {response.status_code}")
                
                # Test GET user connections
                response = requests.get(f"{BASE_URL}/users/{user_id}/connections")
                print(f"GET /users/{user_id}/connections: {response.status_code}")
            
            if self.created_transactions:
                transaction_id = self.created_transactions[0]["id"]
                
                # Test GET transaction by ID
                response = requests.get(f"{BASE_URL}/transactions/{transaction_id}")
                print(f"GET /transactions/{transaction_id}: {response.status_code}")
                
                # Test GET transaction connections
                response = requests.get(f"{BASE_URL}/transactions/{transaction_id}/connections")
                print(f"GET /transactions/{transaction_id}/connections: {response.status_code}")
        
        except Exception as e:
            print(f"❌ Error testing endpoints: {e}")

def main():
    """Main function"""
    generator = TestDataGenerator()
    
    print("=" * 60)
    print("🎯 FLAGRIGHT TEST DATA GENERATOR")
    print("=" * 60)
    
    try:
        # Test if API is running
        response = requests.get(f"{BASE_URL}/users", timeout=5)
        print("✅ API is running and accessible\n")
    except Exception as e:
        print(f"❌ Cannot connect to API at {BASE_URL}")
        print(f"   Make sure your Spring Boot application is running on port 8080")
        print(f"   Error: {e}")
        return
    
    # Generate different types of test data
    print("1️⃣ BASIC TEST SCENARIO")
    print("-" * 30)
    generator.generate_test_scenario(num_users=8, num_transactions=15)
    
    print("\n2️⃣ RELATIONSHIP-FOCUSED DATA")
    print("-" * 30)
    generator.generate_relationship_focused_data()
    
    print("\n3️⃣ ENDPOINT TESTING")
    print("-" * 30)
    generator.test_all_endpoints()
    
    print("\n" + "=" * 60)
    print("🎉 TEST DATA GENERATION COMPLETE!")
    print("=" * 60)
    print("\n🔍 Next Steps:")
    print("   1. Check Swagger UI: http://localhost:8080/swagger-ui.html")
    print("   2. Query Neo4j Browser: http://localhost:7474")
    print("   3. Run these Cypher queries to see relationships:")
    print("      • MATCH (u:User) RETURN u LIMIT 10")
    print("      • MATCH (t:Transaction) RETURN t LIMIT 10")
    print("      • MATCH (u1:User)-[r:SHARES_EMAIL]->(u2:User) RETURN u1, r, u2")
    print("      • MATCH (t1:Transaction)-[r:SAME_DEVICE]->(t2:Transaction) RETURN t1, r, t2")

if __name__ == "__main__":
    main() 