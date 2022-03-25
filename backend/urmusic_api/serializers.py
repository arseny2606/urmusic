from django.contrib.auth import authenticate
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import User, TrackOrder, Restaurant, Track


class RegistrationSerializer(serializers.Serializer):
    email = serializers.CharField(
        label=_("Email"),
        write_only=True
    )
    password = serializers.CharField(
        label=_("Password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )
    password2 = serializers.CharField(
        label=_("Repeat password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )
    city = serializers.CharField(
        label=_("City"),
        write_only=True
    )
    first_name = serializers.CharField(
        label=_("First name"),
        write_only=True
    )
    last_name = serializers.CharField(
        label=_("Last name"),
        write_only=True
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        password2 = attrs.get('password2')
        city = attrs.get('city')
        first_name = attrs.get('first_name')
        last_name = attrs.get('last_name')

        if email and password and password2 and city and first_name and last_name:
            user = User.objects.filter(email=email).count()
            if user:
                msg = _('Такой пользователь уже существует.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _(
                'Должно содержать параметры "email", "password", "password2", "city", "first_name", "last_name".')
            raise serializers.ValidationError(msg, code='authorization')
        if password != password2:
            msg = _('Пароли не совпадают.')
            raise serializers.ValidationError(msg, code='authorization')
        attrs['user'] = user
        return attrs

    def create(self, validated_data):
        user = User.objects.create(email=validated_data["email"])
        user.set_password(validated_data["password"])
        user.save()
        return user


class AuthTokenSerializer(serializers.Serializer):
    email = serializers.CharField(
        label=_("Email"),
        write_only=True
    )
    password = serializers.CharField(
        label=_("Password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )
    token = serializers.CharField(
        label=_("Token"),
        read_only=True
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                                email=email, password=password)
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs


class RestaurantSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField('get_image_url')
    tracks_count = serializers.SerializerMethodField('get_tracks_count')

    def get_image_url(self, restaurant):
        return settings.BASE_URL + restaurant.image.url

    def get_tracks_count(self, restaurant):
        return TrackOrder.objects.filter(restaurant=restaurant).count()

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'tracks_count', 'image_url']


class TrackSerializer(serializers.ModelSerializer):
    track_url = serializers.SerializerMethodField('get_track_url')

    def get_track_url(self, track):
        return settings.BASE_URL + track.file.url

    class Meta:
        model = Track
        fields = ['id', 'title', 'artist', 'track_url']


class TrackOrderSerializer(serializers.ModelSerializer):
    track_data = serializers.SerializerMethodField('get_track_data')

    def get_track_data(self, track_order):
        return TrackSerializer(track_order.track).data

    class Meta:
        model = TrackOrder
        fields = ['id', 'track_data', 'creation_time', 'owner']


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField('get_name')
    avatar_url = serializers.SerializerMethodField('get_avatar_url')
    email = serializers.SerializerMethodField('get_email')

    def get_name(self, user):
        return f"{user.first_name} {user.last_name}"

    def get_avatar_url(self, user):
        return settings.BASE_URL + user.get_avatar()

    def get_email(self, user):
        return f"{user.email[0]}•••{user.email.split('@')[1]}"

    class Meta:
        model = User
        fields = ['id', 'name', 'city', 'avatar_url', 'email']
