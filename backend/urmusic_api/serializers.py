from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User
from django.utils.translation import gettext_lazy as _


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
            msg = _('Должно содержать параметры "email", "password", "password2", "city", "first_name", "last_name".')
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
