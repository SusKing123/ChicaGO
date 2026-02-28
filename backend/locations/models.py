from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)  # e.g., architecture, history
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name