curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ORD-TEST-'$(date +%s)'",
    "customerName": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "items": [],
    "subtotal": 0,
    "shipping": 0,
    "total": 0,
    "status": "pending",
    "shippingAddress": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "1234567890",
      "address": "123 Test St",
      "city": "Test City",
      "state": "Test State",
      "zip": "12345",
      "country": "Test Country"
    },
    "createdAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }'
