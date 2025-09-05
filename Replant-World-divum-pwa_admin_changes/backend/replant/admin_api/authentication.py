from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        """Disable CSRF check for API requests"""
        return  # This skips CSRF validation
