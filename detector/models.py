from django.db import models
from django.contrib.auth.models import User


class ScanResult(models.Model):
    MEDIA_TYPE_CHOICES = [('image', 'Image'), ('video', 'Video')]
    STATUS_PENDING  = 'PENDING'
    STATUS_REVIEWED = 'REVIEWED'
    STATUS_CHOICES  = [
        ('PENDING',  'Pending Expert Review'),
        ('REVIEWED', 'Expert Reviewed'),
    ]

    media_type  = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    file_name   = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    media_file  = models.FileField(upload_to='uploads/', null=True, blank=True)

    # File hash for detecting duplicates (MD5 or SHA256)
    file_hash = models.CharField(max_length=64, unique=False, blank=True, db_index=True)
    # Track if this is a cached result from a previously analyzed identical file
    is_cached_result = models.BooleanField(default=False)
    # Reference to the original scan if this is a cached duplicate
    original_scan = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='cached_duplicates'
    )

    siglip_prob       = models.FloatField(null=True, blank=True)
    xception_prob     = models.FloatField(null=True, blank=True)
    efficientnet_prob = models.FloatField(null=True, blank=True)

    model_ensemble_prob    = models.FloatField(null=True, blank=True)
    model_ensemble_verdict = models.CharField(max_length=20, blank=True)

    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    expert_review = models.OneToOneField(
        'ExpertReview', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='scan'
    )

    final_verdict    = models.CharField(max_length=20, blank=True)
    final_confidence = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} [{self.status}] — {self.final_verdict}"

    def compute_final_verdict(self):
        review = self.expert_review
        if review is None:
            return

        expert_map = {'FAKE': 100.0, 'REAL': 0.0, 'UNCERTAIN': 50.0}
        expert_fake_prob = expert_map.get(review.verdict, 50.0)

        model_scores = [
            s for s in [self.siglip_prob, self.xception_prob, self.efficientnet_prob]
            if s is not None
        ]
        model_avg = sum(model_scores) / len(model_scores) if model_scores else 50.0

        combined = round((expert_fake_prob * 0.50) + (model_avg * 0.50), 2)

        if combined >= 55:
            verdict = 'FAKE'
        elif combined >= 40:
            verdict = 'UNCERTAIN'
        else:
            verdict = 'REAL'

        self.final_verdict    = verdict
        self.final_confidence = combined
        self.status           = 'REVIEWED'
        self.save()


class ExpertReview(models.Model):
    VERDICT_CHOICES = [
        ('FAKE', 'Fake'), ('REAL', 'Real'), ('UNCERTAIN', 'Uncertain / Cannot Determine'),
    ]
    CONFIDENCE_CHOICES = [(1,'Very Low'),(2,'Low'),(3,'Medium'),(4,'High'),(5,'Very High')]

    expert      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    verdict     = models.CharField(max_length=20, choices=VERDICT_CHOICES)
    confidence  = models.IntegerField(choices=CONFIDENCE_CHOICES)
    reasoning   = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-reviewed_at']

    def __str__(self):
        return f"Expert: {self.verdict} (confidence {self.confidence}/5) by {self.expert}"


class ExpertApplication(models.Model):
    STATUS_CHOICES = [
        ('Pending',  'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    name       = models.CharField(max_length=200)
    email      = models.EmailField(unique=True)
    experience = models.TextField(blank=True)
    education  = models.TextField(blank=True)
    q1         = models.TextField(blank=True, help_text='Detection methodology')
    q2         = models.TextField(blank=True, help_text='Handling uncertain AI outputs')
    q3         = models.TextField(blank=True, help_text='AI bias mitigation')
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.name} <{self.email}> [{self.status}]"