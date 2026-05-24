from django.apps import AppConfig


class DetectorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'detector'

    def ready(self):
        # Load all AI models once at Django startup — never per-request
        from detector.model_registry import load_all_models
        load_all_models()