from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from inspection.views import SPAView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inspection.urls')),
    # /media/ uploaded photos (Django serves in dev; WhiteNoise/disk in prod)
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    # catch-all: React SPA for everything else (client-side routing)
    re_path(r'^(?!api/|media/|static/|admin/).*$', SPAView.as_view()),
]
