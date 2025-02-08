from django.db import models

# Create your models here.
class Movie(models.Model):
    GENRE_CHOICES = [
        ('action', 'Action'),
        ('comedy', 'Comedy'),
        ('drama', 'Drama'),
        ('horror', 'Horror'),
        ('romance', 'Romance'),
        ('sci-fi', 'Sci-Fi'),
    ]

    title = models.CharField(max_length=255)
    year = models.IntegerField()
    genre = models.CharField(max_length=50, choices=GENRE_CHOICES)
    poster_image = models.ImageField(upload_to='posters/')
    movie_file = models.FileField(upload_to='movies/')

    def __str__(self):
        return self.title