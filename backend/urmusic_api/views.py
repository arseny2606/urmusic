from rest_framework.response import Response
#преобразование словара в json
from .models import Account
from rest_framework.views import APIView
from .serializers import RegistrationSerializer

class AccountRegistration(APIView):
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            if request.data['password'] == request.data['password2']:
                serializer.save()
                return Response({'data': request.data['username'] \
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
    def get(self, request):
        return Response({'data': '',
                         'method': 'get'})
