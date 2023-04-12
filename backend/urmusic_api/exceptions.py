import math

from django.utils.encoding import force_str
from django.utils.translation import gettext_lazy as _, ngettext
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def our_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    response.data = {}
    if isinstance(exc.detail, (list, dict)):
        for i in exc.detail:
            if exc.detail[i][0].code in ["required", "blank"]:
                response.data["error"] = f"{i}: {str(exc.detail[i][0])}"
            else:
                response.data["error"] = str(exc.detail[i][0])
    else:
        response.data["error"] = exc.detail
    if response is not None:
        response.data['status_code'] = response.status_code
    return response


class OurThrottled(APIException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = _('Превышен временной лимит.')
    extra_detail_singular = _('Попробуйте через {wait} секунд.')
    extra_detail_plural = _('Попробуйте через {wait} секунд.')
    default_code = 'throttled'

    def __init__(self, wait=None, detail=None, code=None):
        if detail is None:
            detail = force_str(self.default_detail)
        if wait is not None:
            wait = math.ceil(wait)
            detail = ' '.join((
                detail,
                force_str(ngettext(self.extra_detail_singular.format(wait=wait),
                                   self.extra_detail_plural.format(wait=wait),
                                   wait))))
        self.wait = wait
        super().__init__(detail, code)
