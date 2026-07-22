from django.urls import path

from . import views

urlpatterns = [
    path("health", views.health),
    path("auth/otp", views.send_otp),
    path("auth/verify", views.verify_otp),
    path("unit", views.unit_detail),
    path("checklist", views.checklist),
    path("inspection", views.inspection_draft),
    path("inspection/<int:pk>", views.inspection_update),
    path("inspection/<int:pk>/submit", views.inspection_submit),
    path("inspection/<int:pk>/report.pdf", views.inspection_report),
    path("media/upload", views.media_upload),
]
