curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ORD-COUPON-'$(date +%s)'",
    "customerName": "Coupon User",
    "email": "coupon@test.com",
    "phone": "1234567890",
    "items": [],
    "subtotal": 100,
    "shipping": 0,
    "total": 80,
    "status": "pending",
    "shippingAddress": {},
    "createdAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "couponCode": "SAVE20",
    "discountTotal": 20
  }'
