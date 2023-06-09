"""urmusic URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from urmusic_api.views import AccountRegistration, AuthByPassword, \
    AllRestaurants, OneRestaurant, \
    GetProfile, AuthByVK, LinkVK, CreateOrder, DeleteOrder, AllTracks, \
    FavouriteRestaurants, AddFavouriteRestaurant, RemoveFavouriteRestaurant,\
    RestaurantEdit, ProfileEdit, CheckGeoData


urlpatterns = [
                  path('admin/', admin.site.urls),
                  path('api/account/register/', AccountRegistration.as_view()),
                  path('api/account/login/', AuthByPassword.as_view()),
                  path('api/account/vklogin/', AuthByVK.as_view()),
                  path('api/account/linkvk/', LinkVK.as_view()),
                  path('api/account/profile/', GetProfile.as_view()),
                  path('api/account/profile/edit', ProfileEdit.as_view()),
                  path('api/restaurants/all/', AllRestaurants.as_view()),
                  path('api/restaurants/get/', OneRestaurant.as_view()),
                  path('api/restaurants/favourites/',
                       FavouriteRestaurants.as_view()),
                  path('api/restaurants/addfavourites/',
                       AddFavouriteRestaurant.as_view()),
                  path('api/restaurants/removefavourites/',
                       RemoveFavouriteRestaurant.as_view()),
                  path('api/restaurants/edit/', RestaurantEdit.as_view()),
                  path('api/tracks/all/', AllTracks.as_view()),
                  path('api/tracks/create/', CreateOrder.as_view()),
                  path('api/restaurants/checkgeodata/', CheckGeoData.as_view()),
                  path('api/tracks/delete/', DeleteOrder.as_view())
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
