from rest_framework.authentication import TokenAuthentication, BasicAuthentication, \
    SessionAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Restaurant
from .serializers import RegistrationSerializer, AuthTokenSerializer, RestaurantSerializer


class AccountRegistration(APIView):
    serializer_class = RegistrationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'email': request.data['email'],
                         'status': 'success'})


class AuthByPassword(APIView):
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'email': user.email
        })


class AllRestaurants(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurants = Restaurant.objects.all()
        response = {"data": [RestaurantSerializer(restaurant).data for restaurant in restaurants]}
        return Response(response)

    def post(self, request):
        self.get(request)
