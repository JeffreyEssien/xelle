# 1. First order: Buy 100 units of a product (assume this exceeds stock)
# 2. Expect failure/error message.

curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ORD-FAIL-TEST",
    "customerName": "Test Fail",
    "email": "fail@test.com",
    "phone": "000000",
    "items": [
        {
            "product": { 
                "id": "test-prod", 
                "name": "Test Product", 
                "inventoryId": "7f83d741-361a-4248-9902-980a3f8e10f6-inv" 
            }, 
            "quantity": 1000 
        }
    ],
    "subtotal": 0,
    "shipping": 0,
    "total": 0,
    "status": "pending",
    "shippingAddress": {},
    "createdAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }'
