import requests
import sys
import json
from datetime import datetime

class HopeOrbAPITester:
    def __init__(self, base_url="https://hopeorb.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.test_user = None
        self.test_charity = None
        self.test_donation = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@hopeorb.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "register",
            200,
            data={
                "name": "Test User",
                "email": test_email,
                "emotion": "happy"
            }
        )
        if success:
            self.test_user = response
            return True
        return False

    def test_get_user(self):
        """Test get user by ID"""
        if not self.test_user:
            print("❌ No test user available")
            return False
        
        success, response = self.run_test(
            "Get User",
            "GET",
            f"user/{self.test_user['id']}",
            200
        )
        return success

    def test_initialize_charities(self):
        """Test charity initialization"""
        success, response = self.run_test(
            "Initialize Charities",
            "POST",
            "init-charities",
            200
        )
        return success

    def test_get_charities(self):
        """Test get all charities"""
        success, response = self.run_test(
            "Get Charities",
            "GET",
            "charities",
            200
        )
        if success and response:
            self.test_charity = response[0] if response else None
            return True
        return False

    def test_create_donation(self):
        """Test donation creation"""
        if not self.test_user or not self.test_charity:
            print("❌ Missing test user or charity")
            return False

        success, response = self.run_test(
            "Create Donation",
            "POST",
            "donate",
            200,
            data={
                "user_id": self.test_user['id'],
                "charity_id": self.test_charity['id'],
                "amount": 100.0
            }
        )
        if success:
            self.test_donation = response
            return True
        return False

    def test_generate_upi_payment(self):
        """Test UPI payment generation"""
        if not self.test_donation:
            print("❌ No test donation available")
            return False

        success, response = self.run_test(
            "Generate UPI Payment",
            "POST",
            "payment/generate-upi",
            200,
            data={
                "donation_id": self.test_donation['id'],
                "amount": self.test_donation['amount']
            }
        )
        if success:
            self.payment_data = response
            return True
        return False

    def test_verify_payment(self):
        """Test payment verification (mocked)"""
        if not self.test_donation or not hasattr(self, 'payment_data'):
            print("❌ Missing donation or payment data")
            return False

        success, response = self.run_test(
            "Verify Payment",
            "POST",
            "payment/verify",
            200,
            data={
                "donation_id": self.test_donation['id'],
                "payment_id": self.payment_data['payment_id']
            }
        )
        return success

    def test_get_donations(self):
        """Test get donations for ripples"""
        success, response = self.run_test(
            "Get Donations",
            "GET",
            "donations?limit=10",
            200
        )
        return success

    def test_user_timeline(self):
        """Test user timeline"""
        if not self.test_user:
            print("❌ No test user available")
            return False

        success, response = self.run_test(
            "Get User Timeline",
            "GET",
            f"user/{self.test_user['id']}/timeline",
            200
        )
        return success

    def test_audio_message(self):
        """Test audio message creation"""
        if not self.test_user or not self.test_donation:
            print("❌ Missing test user or donation")
            return False

        # Mock base64 audio data
        mock_audio = "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"

        success, response = self.run_test(
            "Create Audio Message",
            "POST",
            "audio-message",
            200,
            data={
                "user_id": self.test_user['id'],
                "donation_id": self.test_donation['id'],
                "audio_data": mock_audio,
                "duration": 5.0
            }
        )
        return success

    def test_get_leaderboard(self):
        """Test leaderboard"""
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard?limit=5",
            200
        )
        return success

def main():
    print("🌟 Starting HopeOrb API Testing...")
    tester = HopeOrbAPITester()

    # Test sequence
    tests = [
        ("User Registration", tester.test_user_registration),
        ("Get User", tester.test_get_user),
        ("Initialize Charities", tester.test_initialize_charities),
        ("Get Charities", tester.test_get_charities),
        ("Create Donation", tester.test_create_donation),
        ("Generate UPI Payment", tester.test_generate_upi_payment),
        ("Verify Payment", tester.test_verify_payment),
        ("Get Donations", tester.test_get_donations),
        ("User Timeline", tester.test_user_timeline),
        ("Audio Message", tester.test_audio_message),
        ("Leaderboard", tester.test_get_leaderboard)
    ]

    print(f"\n📋 Running {len(tests)} test suites...")
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 {test_name}")
        print('='*50)
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test suite failed: {str(e)}")

    # Print final results
    print(f"\n{'='*60}")
    print(f"📊 FINAL RESULTS")
    print(f"{'='*60}")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())