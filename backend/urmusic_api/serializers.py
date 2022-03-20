from rest_framework import serializers
from .models import User


class RegistrationSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()
    password2 = serializers.CharField(read_only=True)

    def create(self, validated_data):
        return User.objects.create(**validated_data)
