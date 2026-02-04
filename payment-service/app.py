from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import stripe
import os
import requests
from dotenv import load_dotenv
from bson import ObjectId
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://mongo:27017/ecommerce-payments')
PORT = int(os.getenv('PORT', 3005))
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', 'sk_test_your_stripe_key')
AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://auth-service:3001')
ORDER_SERVICE_URL = os.getenv('ORDER_SERVICE_URL', 'http://order-service:8080')

# Initialize Stripe
stripe.api_key = STRIPE_SECRET_KEY

# MongoDB Connection
client = MongoClient(MONGODB_URI)
db = client['ecommerce-payments']
payments_collection = db['payments']
payment_methods_collection = db['payment_methods']

# Custom JSON Encoder for MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

app.json_encoder = JSONEncoder

# Middleware to verify token
def verify_token():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not token:
        return None, {'message': 'Access denied. No token provided.'}, 401
    
    try:
        response = requests.get(
            f'{AUTH_SERVICE_URL}/verify',
            headers={'Authorization': f'Bearer {token}'}
        )
        if response.status_code == 200:
            return response.json()['user'], None, None
        else:
            return None, {'message': 'Invalid token.'}, 401
    except Exception as e:
        return None, {'message': 'Auth service unavailable.'}, 503

# Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'payment-service'}), 200

# Create Payment Intent (Stripe)
@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    user, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    try:
        data = request.json
        amount = data.get('amount')  # Amount in cents (e.g., 1000 = $10.00)
        currency = data.get('currency', 'usd')
        order_id = data.get('orderId')
        
        if not amount or not order_id:
            return jsonify({'message': 'Amount and orderId are required'}), 400
        
        # Create Stripe Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=int(amount),
            currency=currency,
            metadata={
                'order_id': order_id,
                'user_id': user['userId']
            }
        )
        
        # Save payment record
        payment = {
            'userId': user['userId'],
            'orderId': order_id,
            'amount': amount / 100,  # Convert cents to dollars
            'currency': currency,
            'stripePaymentIntentId': intent['id'],
            'status': 'pending',
            'paymentMethod': None,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = payments_collection.insert_one(payment)
        payment['_id'] = str(result.inserted_id)
        
        return jsonify({
            'clientSecret': intent['client_secret'],
            'paymentId': payment['_id']
        }), 201
        
    except stripe.error.StripeError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

# Process Payment (Demo - simplified without actual Stripe)
@app.route('/process-payment', methods=['POST'])
def process_payment():
    user, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    try:
        data = request.json
        order_id = data.get('orderId')
        payment_method = data.get('paymentMethod', 'card')
        amount = data.get('amount')
        
        if not order_id or not amount:
            return jsonify({'message': 'orderId and amount are required'}), 400
        
        # In production, you'd verify with Stripe here
        # For demo purposes, we'll auto-approve
        
        payment = {
            'userId': user['userId'],
            'orderId': order_id,
            'amount': amount,
            'currency': 'usd',
            'paymentMethod': payment_method,
            'status': 'completed',
            'transactionId': f'txn_{int(datetime.utcnow().timestamp())}',
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = payments_collection.insert_one(payment)
        payment['_id'] = str(result.inserted_id)
        
        # Notify Order Service
        try:
            requests.patch(
                f'{ORDER_SERVICE_URL}/api/orders/{order_id}/payment-status',
                json={'paymentStatus': 'paid', 'transactionId': payment['transactionId']},
                headers={'Authorization': request.headers.get('Authorization')}
            )
        except Exception as e:
            print(f'Failed to notify order service: {e}')
        
        return jsonify({
            'message': 'Payment processed successfully',
            'payment': json.loads(json.dumps(payment, cls=JSONEncoder))
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

# Get payment by ID
@app.route('/payments/<payment_id>', methods=['GET'])
def get_payment(payment_id):
    user, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    try:
        payment = payments_collection.find_one({'_id': ObjectId(payment_id)})
        
        if not payment:
            return jsonify({'message': 'Payment not found'}), 404
        
        # Ensure user owns this payment
        if payment['userId'] != user['userId']:
            return jsonify({'message': 'Access denied'}), 403
        
        return jsonify(json.loads(json.dumps(payment, cls=JSONEncoder))), 200
        
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

# Get user's payment history
@app.route('/payments/user/history', methods=['GET'])
def get_payment_history():
    user, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit
        
        payments = list(payments_collection.find({'userId': user['userId']})
                       .sort('createdAt', -1)
                       .skip(skip)
                       .limit(limit))
        
        total = payments_collection.count_documents({'userId': user['userId']})
        
        return jsonify({
            'payments': json.loads(json.dumps(payments, cls=JSONEncoder)),
            'pagination': {
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

# Refund payment
@app.route('/payments/<payment_id>/refund', methods=['POST'])
def refund_payment(payment_id):
    user, error, status = verify_token()
    if error:
        return jsonify(error), status
    
    try:
        payment = payments_collection.find_one({'_id': ObjectId(payment_id)})
        
        if not payment:
            return jsonify({'message': 'Payment not found'}), 404
        
        if payment['status'] == 'refunded':
            return jsonify({'message': 'Payment already refunded'}), 400
        
        # In production, process refund with Stripe
        # stripe.Refund.create(payment_intent=payment['stripePaymentIntentId'])
        
        payments_collection.update_one(
            {'_id': ObjectId(payment_id)},
            {
                '$set': {
                    'status': 'refunded',
                    'refundedAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'Payment refunded successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

# Webhook for Stripe events (optional)
@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verify webhook signature (in production)
        # event = stripe.Webhook.construct_event(
        #     payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        # )
        
        event = request.json
        
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # Update payment status
            payments_collection.update_one(
                {'stripePaymentIntentId': payment_intent['id']},
                {'$set': {'status': 'completed', 'updatedAt': datetime.utcnow()}}
            )
        
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            payments_collection.update_one(
                {'stripePaymentIntentId': payment_intent['id']},
                {'$set': {'status': 'failed', 'updatedAt': datetime.utcnow()}}
            )
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Webhook error', 'error': str(e)}), 400

if __name__ == '__main__':
    print(f'🚀 Payment Service running on port {PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=True)
