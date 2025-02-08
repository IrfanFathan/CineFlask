from django.shortcuts import render

# Create your views here.

def index(request):
    """Render the index.html template."""
    return render(request, 'index.html')