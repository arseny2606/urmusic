from base64 import b64encode
from collections import OrderedDict
from hashlib import sha256
from hmac import HMAC
from urllib.parse import urlencode

from django.conf import settings
from rest_framework import status
from rest_framework.authentication import TokenAuthentication, \
    BasicAuthentication, \
    SessionAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Restaurant, TrackOrder, User, Track, FavouriteRestaurant
from .serializers import RegistrationSerializer, AuthTokenSerializer, \
    RestaurantSerializer, \
    TrackOrderSerializer, UserSerializer, LinkVKSerializer, \
    CreateOrderSerializer, DeleteOrderSerializer, TrackSerializer, \
    AddFavouriteRestaurantSerializer, \
    RemoveFavouriteRestaurantSerializer


class AccountRegistration(APIView):
    serializer_class = RegistrationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'email': request.data['email'],
                         'token': Token.objects.get_or_create(user=user)[0].key,
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


class AuthByVK(APIView):
    def get(self, request):
        vk_subset = OrderedDict(
            sorted(x for x in request.GET.items() if x[0][:3] == "vk_"))
        hash_code = b64encode(
            HMAC(settings.APP_SECRET_KEY.encode(),
                 urlencode(vk_subset, doseq=True).encode(),
                 sha256).digest())
        decoded_hash_code = hash_code.decode('utf-8')[:-1].replace('+', '-') \
            .replace('/', '_')
        if request.GET["sign"] != decoded_hash_code:
            return Response({
                "error": "Отправлены неверные данные.",
                "status_code": 401
            }, status.HTTP_401_UNAUTHORIZED)
        if User.objects.filter(vk_id=request.GET["vk_user_id"]).count() == 0:
            return Response({
                "error": "Пользователь не найден.",
                "status_code": 404
            }, status.HTTP_404_NOT_FOUND)
        user = User.objects.filter(vk_id=request.GET["vk_user_id"]).first()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'vk_id': user.vk_id
        })

    def post(self, request):
        return self.get(request)


class AllRestaurants(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurants = Restaurant.objects.all()
        response = {
            "data": [RestaurantSerializer(restaurant).data for restaurant in
                     restaurants]}
        return Response(response)

    def post(self, request):
        return self.get(request)


class OneRestaurant(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurant_id = request.GET.get("id")
        if Restaurant.objects.filter(id=restaurant_id).count() == 0:
            return Response(
                {"error": f"Ресторан с id {restaurant_id} не найден!",
                 "status_code": 404},
                status.HTTP_404_NOT_FOUND)
        restaurant = Restaurant.objects.filter(id=restaurant_id).first()
        tracks = TrackOrder.objects.filter(restaurant=restaurant).all()
        response = {"data": RestaurantSerializer(restaurant).data,
                    "tracks":
                        [TrackOrderSerializer(track).data for track in tracks]}
        return Response(response)

    def post(self, request):
        return self.get(request)


class FavouriteRestaurants(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favrestaurants = FavouriteRestaurant.objects.all()
        response = {
            "data": [RestaurantSerializer(favrestaurant.restaurant).data for
                     favrestaurant in favrestaurants if
                     favrestaurant.user == request.user]}
        return Response(response)

    def post(self, request):
        return self.get(request)


class AddFavouriteRestaurant(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = AddFavouriteRestaurantSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'status': 'success'})


class RemoveFavouriteRestaurant(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = RemoveFavouriteRestaurantSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.delete(serializer.validated_data)
        return Response({'status': 'success'})


class GetProfile(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def post(self, request):
        return self.get(request)


class LinkVK(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = LinkVKSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'user_id': request.user.id,
                         'status': 'success'})


class CreateOrder(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CreateOrderSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'status': 'success'})


class DeleteOrder(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = DeleteOrderSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.delete(serializer.validated_data)
        return Response({'status': 'success'})


class AllTracks(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication,
                              TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tracks = Track.objects.all()
        response = {"data": [TrackSerializer(track).data for track in tracks]}
        return Response(response)

    def post(self, request):
        return self.get(request)
