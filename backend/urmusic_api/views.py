from rest_framework.response import Response
from .models import User
from rest_framework.views import APIView
from .serializers import RegistrationSerializer


class AccountRegistration(APIView):
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            if request.data['password'] == request.data['password2']:
                serializer.save()
                return Response({'data': request.data['email'] \
                                         + ', registration success.',
                                 'method': 'post'})
            else:
                return Response({'data': 'passwords not same',
                                 'method': 'post'})
        else:
            print(serializer.is_valid())
            print(request.data)
            return Response({'data': 'invalid data',
                             'method': 'post'})

    def get(self, _):
        return Response({'data': '',
                         'method': 'get'})
