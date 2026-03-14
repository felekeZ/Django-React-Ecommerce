from django.conf import settings
from django.core.files.storage import Storage
from imagekitio import ImageKit

class ImageKitStorage(Storage):
    def __init__(self, location=None):
        self.ik = ImageKit(
            private_key=settings.IMAGEKIT_PRIVATE_KEY
        )
        self.url_endpoint = settings.IMAGEKIT_URL_ENDPOINT
        self.location = location or settings.MEDIA_URL

    def _save(self, name, content):
        upload = self.ik.upload(
            file=content,
            file_name=name
        )
        return upload['response']['filePath']

    def url(self, name):
        return f"{self.url_endpoint}{name}"

    def deconstruct(self):
        return (
            'backend.utils.imagekit_storage.ImageKitStorage',
            [self.location],
            {}
        )