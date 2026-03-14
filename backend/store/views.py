from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from rest_framework import status
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer, UserSerializer, RegisterSerializer

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_product_detail(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    # Check if request data exists and is valid JSON
    if not request.data:
        return Response({'error': 'No data provided'}, status=400)
    
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response({'error': 'product_id is required'}, status=400)
    
    try:
        product = Product.objects.get(id=product_id)
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Get or create cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': 1}
        )
        
        if not created:
            cart_item.quantity += 1
            cart_item.save()
        serializer = CartSerializer(cart)
        
        return Response({
            'message': 'Product added to cart', 
            'cart': serializer.data
        })
        
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')
    if not item_id or quantity is None:
        return Response(
            {'error': 'item ID and quantity are required'}, 
            status=400
        )
    try:
        item = CartItem.objects.get(id=item_id)
        if int(quantity) < 1:
            item.delete()  # Remove item if quantity is less than 1
            return Response(
                {'error': 'Quantity must be at least 1'}, 
                status=400
            )
        item.quantity = quantity
        item.save()
        serializer = CartItemSerializer(item)
        return Response(serializer.data)
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'}, 
            status=404
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    
    if not item_id:
        return Response(
            {'error': 'item_id is required'}, 
            status=400
        )
    
    try:
        # Try to get the item first to verify it exists
        cart_item = CartItem.objects.get(id=item_id)
        cart_item.delete()
        
        return Response(
            {'message': 'Item removed from cart'},
            status=200
        )
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'}, 
            status=404
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        datata = request.data
        name = datata.get('name')
        address = datata.get('address')
        phone = datata.get('phone')
        payment_method = datata.get('payment_method', 'COD')
        
        # Validate phone number
        if not phone or not phone.isdigit() or len(phone) < 10:
            return Response(
                {'error': 'Invalid phone number'}, 
                status=400
            )
        
        # get user's cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=400
            )
        
        # Calculate total - fixed indentation
        total = sum([item.product.price * item.quantity for item in cart.items.all()])
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            total_amount=total,  # Fixed variable name from tottal to total
        )
        
        # Create order items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
        
        # Clear the cart
        cart.items.all().delete()
        
        return Response(
            {
                'message': 'Order placed successfully',
                'order_id': order.id
            }, 
            status=201
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=500
        )
# def create_order(request):
#     try:
#         dateta = request.data

#         name = dateta.get('name')
#         address = dateta.get('address')
#         phone = dateta.get('phone')
#         payment_method = dateta.get('payment_method', 'COD')

#         cart = Cart.objects.first()

#         if not cart or not cart.items.exists():
#             return Response(
#                 {'error': 'Cart is empty'}, 
#                 status=400
#             )
        
#         total = sum(float(item.product.price) * item.quantity for item in cart.items.all())

#         # Create order
#         order = Order.objects.create(
#             user = None,
#             total_amount = total,
#         )

#         # Create order items
#         for item in cart.items.all():
#             OrderItem.objects.create(
#                 order=order,
#                 product=item.product,
#                 quantity=item.quantity,
#                 price=item.product.price
#             )
#         # Clear the cart
#         cart.items.all().delete()
#         return Response(
#             {
#                 'message': 'Order placed successfully',
#                 'order_id': order.id
#             }, 
#             status=201
#         )
#     except Exception as e:
#         return Response(
#             {'error': str(e)}, 
#             status=500
#         )

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"Message": "User created successfully", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)