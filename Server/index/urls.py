"""URL configuration for the server application."""

from django.urls import path, include 
from . import views

urlpatterns = [
    path('', views.index, name='index'),
]
   

  
