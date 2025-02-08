from django.shortcuts import render
from django import forms

# Create your views here.

def index(request):
    """Render the index.html template."""
    return render(request, 'index.html')

class UploadForm(forms.Form):
    file = forms.FileField()

def upload(request):
    """Render the upload.html template with the upload form."""
    if request.method == 'POST':
        form = UploadForm(request.POST, request.FILES)
        if form.is_valid():
            # Handle file upload here
            pass
    else:
        form = UploadForm()
    return render(request, 'upload.html', {'form': form})