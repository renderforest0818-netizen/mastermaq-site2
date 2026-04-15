#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class MastermaqAPITester:
    def __init__(self, base_url="https://service-hub-bh.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, cookies=cookies)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, cookies=cookies)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, cookies=cookies)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response text: {response.text[:200]}")

            return success, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@mastermaq.com", "password": "mastermaq@2026"}
        )
        if success and 'id' in response:
            # Store cookies for future requests
            print("✅ Admin login successful, cookies stored")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": self.test_user_email,
                "password": "testpass123",
                "name": "Test User",
                "phone": "(31) 9 9999-9999",
                "cep": "30112-000",
                "address": "Rua Teste",
                "number": "123",
                "neighborhood": "Centro",
                "city": "Belo Horizonte",
                "state": "MG"
            }
        )
        return success

    def test_user_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": self.test_user_email, "password": "testpass123"}
        )
        return success

    def test_auth_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_equipment_endpoints(self):
        """Test equipment-related endpoints"""
        print("\n" + "="*50)
        print("TESTING EQUIPMENT ENDPOINTS")
        print("="*50)
        
        # Test equipment types
        success1, response1 = self.run_test(
            "Get Equipment Types",
            "GET",
            "equipment/types",
            200
        )
        
        # Verify we have 9 equipment types
        if success1 and isinstance(response1, list) and len(response1) == 9:
            print("✅ Correct number of equipment types (9)")
        else:
            print(f"❌ Expected 9 equipment types, got {len(response1) if isinstance(response1, list) else 'invalid response'}")

        # Test brands
        success2, response2 = self.run_test(
            "Get Brands",
            "GET",
            "equipment/brands",
            200
        )
        
        # Verify we have 12 brands
        if success2 and isinstance(response2, list) and len(response2) == 12:
            print("✅ Correct number of brands (12)")
        else:
            print(f"❌ Expected 12 brands, got {len(response2) if isinstance(response2, list) else 'invalid response'}")

        # Test rules
        success3, response3 = self.run_test(
            "Get Equipment Rules",
            "GET",
            "equipment/rules",
            200
        )

        return success1 and success2 and success3

    def test_service_orders(self):
        """Test service order creation and retrieval"""
        print("\n" + "="*50)
        print("TESTING SERVICE ORDERS")
        print("="*50)
        
        # Test creating a service order (installation)
        success1, response1 = self.run_test(
            "Create Service Order (Installation)",
            "POST",
            "service-orders",
            201,
            data={
                "equipment_type": "trituradores",
                "brand": "Panasonic",
                "service_type": "instalacao"
            }
        )
        
        os_number1 = response1.get('os_number') if success1 else None
        
        # Test creating a service order (repair)
        success2, response2 = self.run_test(
            "Create Service Order (Repair)",
            "POST",
            "service-orders",
            201,
            data={
                "equipment_type": "geladeiras",
                "brand": "Samsung",
                "service_type": "conserto",
                "model": "RF49A5202S9",
                "serial_number": "123456789",
                "warranty_status": "fora_garantia",
                "defect_description": "Geladeira não está gelando adequadamente"
            }
        )
        
        os_number2 = response2.get('os_number') if success2 else None

        # Test getting service order by OS number
        if os_number1:
            success3, response3 = self.run_test(
                f"Get Service Order {os_number1}",
                "GET",
                f"service-orders/{os_number1}",
                200
            )
        else:
            success3 = False

        # Test listing service orders (requires authentication)
        success4, response4 = self.run_test(
            "List Service Orders",
            "GET",
            "service-orders",
            200
        )

        return success1 and success2 and (success3 or not os_number1)

    def test_blog_endpoints(self):
        """Test blog endpoints"""
        print("\n" + "="*50)
        print("TESTING BLOG ENDPOINTS")
        print("="*50)
        
        # Test getting blog articles
        success1, response1 = self.run_test(
            "Get Blog Articles",
            "GET",
            "blog",
            200
        )
        
        # Verify we have 3 seeded articles
        if success1 and isinstance(response1, list) and len(response1) == 3:
            print("✅ Correct number of blog articles (3)")
            
            # Test getting a specific article by slug
            first_article = response1[0]
            if 'slug' in first_article:
                success2, response2 = self.run_test(
                    f"Get Blog Article by Slug",
                    "GET",
                    f"blog/{first_article['slug']}",
                    200
                )
            else:
                success2 = False
        else:
            print(f"❌ Expected 3 blog articles, got {len(response1) if isinstance(response1, list) else 'invalid response'}")
            success2 = False

        return success1 and success2

    def test_contact_endpoint(self):
        """Test contact form submission"""
        print("\n" + "="*50)
        print("TESTING CONTACT ENDPOINT")
        print("="*50)
        
        success, response = self.run_test(
            "Submit Contact Form",
            "POST",
            "contact",
            200,
            data={
                "name": "Test Contact",
                "email": "test@example.com",
                "phone": "(31) 9 9999-9999",
                "message": "This is a test contact message"
            }
        )
        return success

    def test_cep_endpoint(self):
        """Test CEP lookup endpoint"""
        print("\n" + "="*50)
        print("TESTING CEP ENDPOINT")
        print("="*50)
        
        success, response = self.run_test(
            "CEP Lookup",
            "GET",
            "cep/01001000",
            200
        )
        
        # Verify response has expected fields
        if success and isinstance(response, dict):
            expected_fields = ['logradouro', 'bairro', 'localidade', 'uf']
            has_fields = all(field in response for field in expected_fields)
            if has_fields:
                print("✅ CEP response has all expected fields")
            else:
                print(f"❌ CEP response missing fields. Got: {list(response.keys())}")
        
        return success

    def test_auth_refresh(self):
        """Test token refresh"""
        success, response = self.run_test(
            "Refresh Token",
            "POST",
            "auth/refresh",
            200
        )
        return success

    def test_auth_logout(self):
        """Test logout"""
        success, response = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        return success

def main():
    print("🚀 Starting Mastermaq API Tests")
    print("=" * 60)
    
    tester = MastermaqAPITester()
    
    # Test authentication flow
    if not tester.test_admin_login():
        print("❌ Admin login failed, continuing with other tests...")
    
    # Test user registration and login
    if not tester.test_user_registration():
        print("❌ User registration failed")
    
    if not tester.test_user_login():
        print("❌ User login failed")
    
    # Test auth/me endpoint
    tester.test_auth_me()
    
    # Test equipment endpoints
    tester.test_equipment_endpoints()
    
    # Test service orders
    tester.test_service_orders()
    
    # Test blog endpoints
    tester.test_blog_endpoints()
    
    # Test contact endpoint
    tester.test_contact_endpoint()
    
    # Test CEP endpoint
    tester.test_cep_endpoint()
    
    # Test auth refresh and logout
    tester.test_auth_refresh()
    tester.test_auth_logout()
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 FINAL RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())