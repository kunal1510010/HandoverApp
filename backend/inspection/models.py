import secrets

from django.db import models


def _generate_token():
    return secrets.token_urlsafe(32)


class Flat(models.Model):
    STATUS_CHOICES = [
        ("handover_ready", "handover_ready"),
        ("not_ready", "not_ready"),
        ("issues", "issues"),
        ("clear", "clear"),
    ]

    customer_number = models.CharField(max_length=15, unique=True)
    customer_name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    project = models.CharField(max_length=120)
    product = models.CharField(max_length=60)
    tower = models.CharField(max_length=10)
    unit_no = models.CharField(max_length=30)
    config = models.CharField(max_length=20)
    sqft = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="handover_ready")

    def __str__(self):
        return self.unit_no


class Room(models.Model):
    flat = models.ForeignKey(Flat, related_name="rooms", on_delete=models.CASCADE)
    key = models.CharField(max_length=40)
    label = models.CharField(max_length=60)
    type = models.CharField(max_length=20)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = ("flat", "key")

    def __str__(self):
        return f"{self.flat.unit_no} / {self.label}"


class ChecklistItem(models.Model):
    item_id = models.CharField(max_length=40, unique=True)
    category = models.CharField(max_length=60)
    subcategory = models.CharField(max_length=60)
    text = models.TextField()
    applies_to = models.JSONField(default=list)
    active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)

    def __str__(self):
        return self.item_id


class AuthToken(models.Model):
    """Opaque bearer token minted at OTP verify, scoped to one flat."""

    flat = models.ForeignKey(Flat, related_name="tokens", on_delete=models.CASCADE)
    key = models.CharField(max_length=64, unique=True, default=_generate_token)
    created_at = models.DateTimeField(auto_now_add=True)


class Inspection(models.Model):
    MODE_CHOICES = [("inspector", "inspector"), ("customer", "customer"), ("fm", "fm")]
    STATUS_CHOICES = [("in_progress", "in_progress"), ("submitted", "submitted")]

    flat = models.ForeignKey(Flat, related_name="inspections", on_delete=models.CASCADE)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default="inspector")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="in_progress")
    inspector_name = models.CharField(max_length=120, blank=True)
    inspector_contact = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=120, blank=True)
    fm_name = models.CharField(max_length=120, blank=True)
    fm_contact = models.CharField(max_length=20, blank=True)
    inspection_date = models.DateField(null=True, blank=True)
    expected_resolution_date = models.DateField(null=True, blank=True)
    customer_signed = models.BooleanField(default=False)
    inspector_signed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ItemResponse(models.Model):
    RESPONSE_CHOICES = [("VERIFIED", "VERIFIED"), ("ISSUE", "ISSUE"), ("SKIPPED", "SKIPPED")]

    inspection = models.ForeignKey(Inspection, related_name="responses", on_delete=models.CASCADE)
    room_key = models.CharField(max_length=40)
    item_id = models.CharField(max_length=40)
    response = models.CharField(max_length=10, choices=RESPONSE_CHOICES, null=True, blank=True)
    skip_reason = models.CharField(max_length=120, blank=True)

    class Meta:
        unique_together = ("inspection", "room_key", "item_id")


class Issue(models.Model):
    item_response = models.ForeignKey(ItemResponse, related_name="issues", on_delete=models.CASCADE)
    heading = models.CharField(max_length=160)
    exact_location = models.TextField()


class Photo(models.Model):
    # Nullable: a photo is uploaded (and gets a URL) before the issue that
    # references it is saved; the link is filled in once the issue is synced.
    issue = models.ForeignKey(Issue, related_name="photos", null=True, blank=True, on_delete=models.SET_NULL)
    image = models.ImageField(upload_to="issues/")
