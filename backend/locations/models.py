from django.db import models

class Architecture(models.Model):
    name =  models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    fact = models.TextField()

    def __str__(self):
        return f"{self.name} - {self.fact}"

class History(models.Model):
    name =  models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    fact = models.TextField()


    def __str__(self):
        return f"{self.name} - {self.fact}"
    
class Music(models.Model):
    name =  models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    fact = models.TextField()

    def __str__(self):
        return f"{self.name} - {self.fact}"
    
class Films(models.Model):
    name =  models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    fact = models.TextField()

    def __str__(self):
        return f"{self.name} - {self.fact}"