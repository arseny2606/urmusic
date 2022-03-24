from django.contrib import admin

# Register your models here.
from .models import User, AccountType, TrackOrder, Track, Restaurant

admin.site.register(User)
admin.site.register(AccountType)
admin.site.register(Restaurant)
admin.site.register(Track)
admin.site.register(TrackOrder)
