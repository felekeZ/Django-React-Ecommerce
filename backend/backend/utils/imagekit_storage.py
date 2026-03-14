import os
from django.core.files.storage import Storage
from django.core.exceptions import ImproperlyConfigured
from django.utils.deconstruct import deconstructible
from imagekitio import ImageKit
from pathlib import Path
import io

@deconstructible
class ImageKitStorage(Storage):
    def __init__(self, private_key=None, url_endpoint=None):
        self.private_key = private_key or os.getenv("IMAGEKIT_PRIVATE_KEY")
        self.url_endpoint = url_endpoint or os.getenv("IMAGEKIT_URL_ENDPOINT")
        
        if not self.private_key:
            raise ImproperlyConfigured("IMAGEKIT_PRIVATE_KEY is not set")
        if not self.url_endpoint:
            raise ImproperlyConfigured("IMAGEKIT_URL_ENDPOINT is not set")
        
        # Initialize ImageKit client with just private_key (as shown in docs)
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
            
            # Upload using the files.upload method as shown in docs
            # The SDK accepts file as bytes, Path, or file object
            upload_response = self.imagekit.files.upload(
                file=file_content,  # Can be bytes, Path, or file object
                file_name=name,
                folder="/products",  # Optional: organize in folders
                use_unique_file_name=False,  # Prevent ImageKit from renaming
                tags=["django-upload"]  # Optional tags
            )
            
            # Based on the docs, the response has file_id and url attributes
            # We'll store the file path/URL for later use
            if hasattr(upload_response, 'file_id'):
                # Store the file_id or file path
                # You might want to store just the filename part
                return name
            elif hasattr(upload_response, 'url'):
                # If response has URL, extract the path
                url = upload_response.url
                # Extract just the path part from the URL
                if self.url_endpoint in url:
                    return url.replace(self.url_endpoint, '').lstrip('/')
                return name
            else:
                return name
                
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
        
        # Use the helper.build_url method as shown in docs
        try:
            url = self.imagekit.helper.build_url(
                url_endpoint=self.url_endpoint,
                src=name,
                transformation=[]  # No transformations by default
            )
            return url
        except Exception:
            # Fallback to simple URL construction
            return f"{self.url_endpoint.rstrip('/')}/{name.lstrip('/')}"

    def exists(self, name):
        """
        Check if a file exists on ImageKit.
        The SDK doesn't have a direct method for this, so we'll return False
        to always upload new files.
        """
        return False

    def size(self, name):
        """
        Return the size of the file in bytes.
        The SDK doesn't have a direct method for this.
        """
        return 0

    def delete(self, name):
        """
        Delete the file from ImageKit.
        You would need the file_id to delete, which we don't store.
        """
        pass

    def get_available_name(self, name, max_length=None):
        """
        Return a filename that's available on the storage.
        """
        return name