import os
from django.core.files.storage import Storage
from django.core.exceptions import ImproperlyConfigured
from django.utils.deconstruct import deconstructible
from imagekitio import ImageKit

@deconstructible
class ImageKitStorage(Storage):
    def __init__(self, private_key=None, url_endpoint=None):
        self.private_key = private_key or os.getenv("IMAGEKIT_PRIVATE_KEY")
        self.url_endpoint = url_endpoint or os.getenv("IMAGEKIT_URL_ENDPOINT")
        
        if not self.private_key:
            raise ImproperlyConfigured("IMAGEKIT_PRIVATE_KEY is not set")
        if not self.url_endpoint:
            raise ImproperlyConfigured("IMAGEKIT_URL_ENDPOINT is not set")
        
        self.imagekit = ImageKit(
            private_key=self.private_key
        )

    def _save(self, name, content):
        """
        Save the file to ImageKit using the files.upload method
        """
        try:
            # Read the file content
            file_content = content.read()
            
            # Upload to ImageKit
            upload_response = self.imagekit.files.upload(
                file=file_content,
                file_name=name,
                folder="/products",
                use_unique_file_name=False,
                tags=["django-upload"]
            )
            
            # Check the response structure and return the FULL path including folder
            if hasattr(upload_response, 'file_path'):
                # If response has file_path, use it
                return upload_response.file_path.lstrip('/')
            elif hasattr(upload_response, 'url'):
                # If response has url, extract the path
                url = upload_response.url
                # Extract everything after the url_endpoint
                if self.url_endpoint in url:
                    path = url.replace(self.url_endpoint, '').lstrip('/')
                    return path
                return f"products/{name}"
            else:
                # Default to including the folder
                return f"products/{name}"
                
        except Exception as e:
            raise IOError(f"Failed to upload to ImageKit: {e}")

    def url(self, name):
        """
        Return the URL for the file
        """
        if not name:
            return ''
        
        # If name is already a full URL, return it
        if name.startswith(('http://', 'https://')):
            return name
        
        # Clean the name - remove any leading slash
        clean_name = name.lstrip('/')
        
        # Use the helper.build_url method
        try:
            url = self.imagekit.helper.build_url(
                url_endpoint=self.url_endpoint,
                src=clean_name,
                transformation=[]
            )
            return url
        except Exception:
            # Fallback to simple URL construction
            return f"{self.url_endpoint.rstrip('/')}/{clean_name}"

    def exists(self, name):
        return False

    def size(self, name):
        return 0

    def delete(self, name):
        pass

    def get_available_name(self, name, max_length=None):
        return name