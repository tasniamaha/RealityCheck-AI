from django.urls import path
from detector import views

urlpatterns = [
    # ── Public Django-template pages ──────────────────────────────────────────
    path('',                              views.index,        name='index'),
    path('detect/',                       views.detect,       name='detect'),
    path('scan/<int:scan_id>/status/',    views.scan_status,  name='scan_status'),

    # ── Legacy expert template views ──────────────────────────────────────────
    path('expert/login/',                 views.expert_login,  name='expert_login'),
    path('expert/logout/',                views.expert_logout, name='expert_logout'),
    path('expert/',                       views.expert_queue,  name='expert_queue'),
    path('expert/review/<int:scan_id>/',  views.expert_review, name='expert_review'),

    # ── JSON API (consumed by React frontend) ─────────────────────────────────
    
    path('api/auth/login/',         views.api_login,              name='api_login'),
    path('api/auth/logout/',        views.api_logout,             name='api_logout'),
    path('api/auth/me/',            views.api_me,                 name='api_me'),
    path('api/auth/register/',      views.api_register,           name='api_register'),
    path('api/auth/expert-register/', views.api_expert_register,  name='api_expert_register'),

    path('api/expert/queue/',                views.api_expert_queue,      name='api_expert_queue'),
    path('api/expert/review/<int:scan_id>/', views.api_expert_review,     name='api_expert_review'),

    path('api/admin/applications/',           views.api_admin_applications,        name='api_admin_applications'),
    path('api/admin/applications/<int:app_id>/action/', views.api_admin_application_action, name='api_admin_application_action'),
    path('api/admin/scans/',                  views.api_admin_scans,               name='api_admin_scans'),

    # ── Claude proxy: model voice generation ─────────────────────────────────
    path('api/model-voice/',                  views.api_model_voice,               name='api_model_voice'),
]