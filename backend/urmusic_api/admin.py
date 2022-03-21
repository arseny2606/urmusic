from django.contrib import admin

# Register your models here.
from .models import User, AccountType

admin.site.register(User)
admin.site.register(AccountType)
