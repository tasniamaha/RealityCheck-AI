from django.contrib import admin
from detector.models import ScanResult, ExpertReview, ExpertApplication, Complaint


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
    list_display  = ('file_name', 'media_type', 'uploaded_by', 'status',
                     'model_ensemble_verdict', 'final_verdict',
                     'final_confidence', 'uploaded_at')
    list_filter   = ('status', 'media_type', 'final_verdict')
    search_fields = ('file_name', 'uploaded_by__username')
    readonly_fields = ('uploaded_at', 'final_verdict', 'final_confidence')


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display  = ('scan', 'reporter', 'reason', 'status', 'created_at')
    list_filter   = ('status',)
    search_fields = ('reason', 'details', 'reporter__username')
    readonly_fields = ('created_at',)
