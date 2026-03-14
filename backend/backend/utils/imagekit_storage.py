from imagekitio import ImageKit
import os
from django.core.files.storage import Storage
from django.core.exceptions import ImproperlyConfigured
from django.utils.deconstruct import deconstructible

@deconstructible
class ImageKitStorage(Storage):
    def __init__(self, private_key=None, url_endpoint=None):
        self.private_key = private_key or os.getenv("IMAGEKIT_PRIVATE_KEY")
        self.url_endpoint = url_endpoint or os.getenv("IMAGEKIT_URL_ENDPOINT")
        
        if not self.private_key:
            raise ImproperlyConfigured("IMAGEKIT_PRIVATE_KEY is not set")
        if not self.url_endpoint:
            raise ImproperlyConfigured("IMAGEKIT_URL_ENDPOINT is not set")
            
        self.ik = ImageKit(private_key=self.private_key)

    def _save(self, name, content):
        """
        Save the file to ImageKit
        """
        try:
            upload = self.ik.upload(
                file=content.read(),
                file_name=name,
                use_unique_file_name=False  # Prevent ImageKit from renaming
            )
            return upload['response']['filePath']
        except Exception as e:
            raise IOError(f"Failed to upload to ImageKit: {e}")

    def url(self, name):
        """
        Return the URL for the file
        """
        if not name:
            return ''
        return f"{self.url_endpoint}{name}"

    def exists(self, name):
        """
        Check if a file exists on ImageKit.
        Since ImageKit doesn't have a direct API to check file existence,
        we'll implement a basic check or return False to always upload.
        """
        try:
            # Try to get file info - you might need to implement this based on ImageKit API
            # For now, return False to always upload new files
            return False
        except Exception:
            return False

    def size(self, name):
        """
        Return the size of the file in bytes.
        """
        # If you can't get the size, return 0
        return 0

    def delete(self, name):
        """
        Delete the file from ImageKit.
        You'll need to implement this if you want to support file deletion.
        """
        # Implement file deletion if needed
        pass

    def get_available_name(self, name, max_length=None):
        """
        Return a filename that's available on the storage.
        """
        return name  # Return the original name