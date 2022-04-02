import datetime
import urllib.request

import mutagen as mutagen
import pytz
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .exceptions import OurThrottled
from .models import User, TrackOrder, Restaurant, Track, FavouriteRestaurant


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
        user = User.objects.create(email=validated_data["email"], city=validated_data["city"],
                                   first_name=validated_data["first_name"],
                                   last_name=validated_data["last_name"])
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
        fields = ['id', 'name', 'address', 'description', 'tracks_count',
                  'image_url', 'owner']


class AddFavouriteRestaurantSerializer(serializers.Serializer):
    restaurant = serializers.IntegerField(write_only=True)

    def validate(self, attrs):
        restaurant = attrs.get('restaurant')
        if not restaurant:
            msg = _('Должно содержать параметр "restaurant".')
            raise serializers.ValidationError(msg, code='validation')
        restaurant = attrs.get('restaurant')
        if not Restaurant.objects.filter(id=restaurant).count():
            msg = _('Ресторана с таким ID не существует.')
            raise serializers.ValidationError(msg, code='validation')
        attrs["restaurant"] = Restaurant.objects.filter(
            id=restaurant).first()
        return attrs

    def create(self, validated_data):
        instance, _ = FavouriteRestaurant.objects.get_or_create(
            restaurant=validated_data["restaurant"],
            user=self.context["request"].user)
        return instance


class RemoveFavouriteRestaurantSerializer(serializers.Serializer):
    restaurant = serializers.IntegerField(write_only=True)

    def validate(self, attrs):
        restaurant = attrs.get("restaurant")
        if not restaurant:
            msg = _('Должен содержать параметр "restaurant"')
            raise serializers.ValidationError(msg, code='validation')
        if not FavouriteRestaurant.objects.filter(restaurant=restaurant,
                                                  user=self.context['request'].user).count():
            msg = _('Такой записи не существует.')
            raise serializers.ValidationError(msg, code='validation')
        _restaurant = FavouriteRestaurant.objects.filter(restaurant=restaurant,
                                                         user=self.context['request'].user).first()
        attrs["restaurant"] = _restaurant
        return attrs

    def delete(self, validated_data):
        validated_data["restaurant"].delete()


class TrackSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField('get_track_duration')
    track_url = serializers.SerializerMethodField('get_track_url')

    def get_track_duration(self, track):
        audio_info = mutagen.File(track.file).info
        duration = audio_info.length
        return f"{str(int(duration // 60)).zfill(2)}:{str(int(duration % 60)).zfill(2)}"

    def get_track_url(self, track):
        return settings.BASE_URL + track.file.url

    class Meta:
        model = Track
        fields = ['id', 'title', 'artist', 'duration', 'track_url']


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
        return f"{user.email[0]}•••@{user.email.split('@')[1]}"

    class Meta:
        model = User
        fields = ['id', 'name', 'city', 'avatar_url', 'email']


class LinkVKSerializer(serializers.Serializer):
    vk_id = serializers.IntegerField(
        label=_("VK ID"),
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
    city = serializers.CharField(
        label=_("City"),
        write_only=True
    )
    photo_url = serializers.CharField(
        label=_("Photo URL"),
        write_only=True
    )

    def validate(self, attrs):
        vk_id = attrs.get('vk_id')
        first_name = attrs.get('first_name')
        last_name = attrs.get('last_name')
        city = attrs.get('city')
        photo_url = attrs.get('photo_url')

        if not vk_id or not first_name or not last_name or not city or not photo_url:
            msg = _(
                'Должно содержать параметры "vk_id", "first_name", "last_name", "city", "photo_url".')
            raise serializers.ValidationError(msg, code='validation')
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        user.vk_id = validated_data["vk_id"]
        user.first_name = validated_data["first_name"]
        user.last_name = validated_data["last_name"]
        user.city = validated_data["city"]
        img_temp = NamedTemporaryFile()
        img_temp.write(
            urllib.request.urlopen(validated_data["photo_url"]).read())
        img_temp.flush()
        user.avatar.save(f"avatar_{user.id}.jpg", File(img_temp), save=True)
        user.save()
        return user


class CreateOrderSerializer(serializers.Serializer):
    restaurant_id = serializers.IntegerField(write_only=True)
    track_id = serializers.IntegerField(write_only=True)
    force = serializers.BooleanField(default=False, write_only=True, required=False)

    def validate(self, attrs):
        restaurant_id = attrs.get('restaurant_id')
        track_id = attrs.get('track_id')
        force = attrs.get('force')
        if not track_id or not restaurant_id:
            msg = _(
                'Должно содержать параметры "restaurant_id", "track_id".')
            raise serializers.ValidationError(msg, code='validation')
        if not Track.objects.filter(id=track_id).count():
            msg = _(
                'Трека с таким ID не существует.')
            raise serializers.ValidationError(msg, code='validation')
        attrs["track"] = Track.objects.filter(id=track_id).first()
        if not Restaurant.objects.filter(id=restaurant_id).count():
            msg = _(
                'Ресторана с таким ID не существует.')
            raise serializers.ValidationError(msg, code='validation')
        time_array = TrackOrder.objects.filter(owner=self.context['request'].user).all()
        if time_array.count():
            time = time_array.last().creation_time.timestamp()
            now = datetime.datetime.now(tz=pytz.timezone(settings.TIME_ZONE)).timestamp()
            if now - time < 0 * 5:
                msg = 'Вы слишком быстро добавляете треки.'
                raise OurThrottled(wait=60 * 5 - int(now - time), detail=msg)
            if time_array.count() >= 3:
                msg = _('Вы добавили слишком много треков.')
                raise OurThrottled(detail=msg)
        attrs["restaurant"] = Restaurant.objects.filter(id=restaurant_id).first()
        if TrackOrder.objects.filter(~Q(restaurant=attrs['restaurant']),
                                     owner=self.context['request'].user).count():
            if force:
                order_list = TrackOrder.objects.filter(~Q(id=restaurant_id),
                                                       owner=self.context['request'].user).all()
                order_list.delete()
            else:
                msg = 'Вы не можете добавлять треки в очередь другого ресторана.'
                raise serializers.ValidationError(msg, code='validation')
        attrs["restaurant"] = Restaurant.objects.filter(
            id=restaurant_id).first()
        return attrs

    def create(self, validated_data):
        order = TrackOrder(restaurant=validated_data['restaurant'],
                           track=validated_data['track'],
                           owner=self.context['request'].user)
        order.save()
        return order


class DeleteOrderSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(write_only=True)

    def validate(self, attrs):
        order_id = attrs.get("order_id")
        if not order_id:
            msg = _(
                'Должно содержать параметр "order_id".')
            raise serializers.ValidationError(msg, code='validation')
        if not TrackOrder.objects.filter(id=order_id).count():
            msg = _(
                'Такой записи в очереди не существует.')
            raise serializers.ValidationError(msg, code='validation')
        track_order = TrackOrder.objects.filter(id=order_id).first()
        if track_order.owner != self.context[
            "request"].user and track_order.restaurant.owner != \
                self.context["request"].user:
            msg = _(
                'Вы не являетесь владельцем этой записи в очереди.')
            raise serializers.ValidationError(msg, code='validation')
        attrs["order"] = track_order
        return attrs

    def delete(self, validated_data):
        validated_data["order"].delete()


class ProfileEditSerializer(serializers.Serializer):
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    city = serializers.CharField(max_length=200, write_only=True, required=False)

    def validate(self, attrs):
        first_name = attrs.get("first_name")
        last_name = attrs.get("last_name")
        city = attrs.get("city")
        attrs['user'] = self.context['request'].user
        if not first_name:
            attrs['first_name'] = attrs['user'].first_name
        if not last_name:
            attrs['last_name'] = attrs['user'].last_name
        if not city:
            attrs['city'] = attrs['user'].city
        return attrs

    def update(self, instance, validated_data):
        user = validated_data['user']
        user.first_name = validated_data['first_name']
        user.last_name = validated_data['last_name']
        user.city = validated_data['city']
        user.save()
