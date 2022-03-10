from rest_framework import serializers
from .models import Account

class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.CharField()
    password = serializers.CharField()
    password2 = serializers.CharField(read_only=True)
    def create(self, validated_data):
        return Account.objects.create(**validated_data)
