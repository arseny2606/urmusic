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
