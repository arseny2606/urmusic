from django.db import models

class Account(models.Model):
    id = models.IntegerField(primary_key=True)
    password = models.CharField(max_length=255, default='')
    email = models.CharField(max_length=255, default='', unique=True)
