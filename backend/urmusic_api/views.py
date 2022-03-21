from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegistrationSerializer


class AccountRegistration(APIView):
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            if request.data['password'] == request.data['password2']:
                serializer.save()
                return Response({'email': request.data['email'],
                                 'status': 'success'})
            else:
                return Response({'error': 'passwords aren\'t same'})
        else:
            return Response({'error': 'invalid data'})

    def get(self, _):
        return Response({'data': '',
                         'method': 'get'})
