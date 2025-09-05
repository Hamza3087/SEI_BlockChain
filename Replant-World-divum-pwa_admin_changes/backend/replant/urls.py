"""
URL configuration for replant project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
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
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .admin_api.urls import urlpatterns as admin_api

import env

from .api.urls import urlpatterns as api

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api)),
    path("api/", include(admin_api)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Hack: I wanted a link to the API docs page in the admin panel.
    # Django Admin provides one for the django.contrib.admindocs app by default.
    # We don't use it, so we can reuse the URL name.
    # https://github.com/django/django/blob/main/django/contrib/admin/templates/admin/base.html#L50
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="django-admindocs-docroot",
    ),
]

if env.DEBUG:
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]

if env.ENV == "local":
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
