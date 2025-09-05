from enum import auto

from django.db import models


class UserHistory(models.Model):
    class EventType(models.TextChoices):
        LOCATION_SUCCEEDED = auto()
        LOCATION_FAILED = auto()

    event_type = models.CharField(max_length=20, choices=EventType.choices)

    user_agent = models.TextField()
    os = models.CharField(max_length=50)
    os_version = models.CharField(max_length=50)
    browser = models.CharField(max_length=50)
    browser_version = models.CharField(max_length=50)
    device = models.CharField(max_length=50)

    error_name = models.CharField(max_length=50, blank=True)
    error_message = models.TextField(blank=True)

    accuracy = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="accuracy [m]",
        null=True,
        blank=True,
    )

    user = models.ForeignKey("replant.User", on_delete=models.PROTECT)
    created_at = models.DateTimeField()

    class Meta:
        verbose_name = "User history log"
        verbose_name_plural = "User history"

    def __str__(self):
        return f"{self.pk} {UserHistory.EventType(self.event_type).label}"
