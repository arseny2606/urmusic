import datetime

from django.contrib.auth.models import UserManager, AbstractUser
from django.db import models


class AccountType(models.Model):
    name = models.CharField(max_length=100, unique=True)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    city = models.CharField(max_length=200)
    vk_id = models.IntegerField(unique=True, blank=True, null=True)
    account_type = models.ForeignKey(AccountType, on_delete=models.SET_DEFAULT,
                                     default=1)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    @staticmethod
    def create_super_user():
        self = User.objects.create(id=1, email="admin@test.com",
                                   account_type_id=3, is_staff=True,
                                   is_superuser=True)
        self.set_password("admin")
        self.save()

    def get_avatar(self):
        if not self.avatar:
            return "/media/avatar_placeholder.jpg"
        return self.avatar.url

    def __str__(self):
        return f"{self.account_type.name} user with login {self.email} and vk id {self.vk_id}"


class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=150)
    description = models.TextField()
    image = models.ImageField(upload_to="restaurant_images/", blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def get_image(self):
        if not self.image:
            return "/media/restaurant_placeholder.jpg"
        return self.image.url


class FavouriteRestaurant(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Track(models.Model):
    title = models.TextField()
    artist = models.TextField(null=True)
    file = models.FileField(upload_to='tracks/', null=True)


class TrackOrder(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    creation_time = models.DateTimeField(default=datetime.datetime.now)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
