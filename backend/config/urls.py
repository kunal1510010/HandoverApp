from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

from inspection.views import SPAView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inspection.urls')),
    # /media/ uploaded photos & floor plans. Served directly by Django in both
    # dev and prod — there's no separate static/media host in this deployment,
    # so django.conf.urls.static.static() (a DEBUG-only no-op) can't be used here.
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    # catch-all: React SPA for everything else (client-side routing)
    re_path(r'^(?!api/|media/|static/|admin/).*$', SPAView.as_view()),
]
