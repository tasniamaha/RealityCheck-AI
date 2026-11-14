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
        """
        The expert decides. The models never outvote a person.

        final_verdict    = the expert's verdict. One exception: a low-confidence
                           expert (1-2 out of 5) who contradicts a clear model
                           label gives UNCERTAIN, so the case can be looked at again.
        final_confidence = how sure the result is (not a fake probability):
                           expert confidence 1..5 -> 50..90, +5 when the models
                           agree with the expert, -10 when they clearly disagree.
        """
        review = self.expert_review
        if review is None:
            return

        from detector.image_detector import _verdict
        model_label = None
        if self.model_ensemble_prob is not None:
            model_label = _verdict(self.model_ensemble_prob)

        verdict    = review.verdict
        confidence = {1: 50.0, 2: 60.0, 3: 70.0, 4: 80.0, 5: 90.0}.get(review.confidence, 70.0)

        if verdict in ('FAKE', 'REAL') and model_label in ('FAKE', 'REAL'):
            if model_label == verdict:
                confidence += 5
            else:
                confidence -= 10
                if review.confidence <= 2:
                    verdict = 'UNCERTAIN'

        self.final_verdict    = verdict
        self.final_confidence = confidence
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