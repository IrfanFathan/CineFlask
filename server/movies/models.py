from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=200)
    genre = models.CharField(max_length=100)
    poster = models.ImageField(upload_to='posters/')
    file = models.FileField(upload_to='movies/')

    def __str__(self):
        return self.title
