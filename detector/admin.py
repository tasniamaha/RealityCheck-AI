from django.contrib import admin
from detector.models import ScanResult, ExpertReview, ExpertApplication


@admin.register(ExpertApplication)
class ExpertApplicationAdmin(admin.ModelAdmin):
    list_display  = ('name', 'email', 'status', 'applied_at')
    list_filter   = ('status',)
    search_fields = ('name', 'email')
    readonly_fields = ('applied_at',)


@admin.register(ExpertReview)
class ExpertReviewAdmin(admin.ModelAdmin):
    list_display  = ('expert', 'verdict', 'confidence', 'reviewed_at')
    list_filter   = ('verdict', 'confidence')
    search_fields = ('expert__username', 'reasoning')
    readonly_fields = ('reviewed_at',)


@admin.register(ScanResult)
class ScanResultAdmin(admin.ModelAdmin):
    list_display  = ('file_name', 'media_type', 'status',
                     'model_ensemble_verdict', 'final_verdict',
                     'final_confidence', 'uploaded_at')
    list_filter   = ('status', 'media_type', 'final_verdict')
    search_fields = ('file_name',)
    readonly_fields = ('uploaded_at', 'final_verdict', 'final_confidence')