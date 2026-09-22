import os
from typing import BinaryIO
import requests
import dropbox
from dropbox.exceptions import ApiError
from dropbox.files import WriteMode
from dropbox.sharing import CreateSharedLinkWithSettingsError


def get_access_token(refresh_token: str, app_key: str, app_secret: str) -> str:
    data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
    }

    response = requests.post(
        "https://api.dropboxapi.com/oauth2/token",
        data=data,
        auth=(app_key, app_secret)
    )

    if response.ok:
        return response.json()['access_token']
    else:
        raise RuntimeError("Error obteniendo access token de Dropbox: " + response.text)


def _get_dropbox_client():
    refresh_token = os.getenv("DROPBOX_REFRESH_TOKEN", "UToFxa2itbkAAAAAAAAAATyp6OE1TLirLtNomCTAPf41iz3WJpKF1Ota4x5fp6K4")
    app_key = os.getenv("DROPBOX_APP_KEY", "sk2ijo2e9u12dbk")
    app_secret = os.getenv("DROPBOX_APP_SECRET", "rnm0outftw8l3wh")

    token = get_access_token(refresh_token=refresh_token, app_key=app_key, app_secret=app_secret)
    return dropbox.Dropbox(token)


def subir_a_dropbox(file: BinaryIO, nombre_destino: str) -> str:
    """
    Sube un archivo a Dropbox y retorna una URL pública directa.
    """
    try:
        dbx = _get_dropbox_client()
        res = dbx.files_upload(file.read(), nombre_destino, mode=WriteMode.add)

        try:
            shared_link_metadata = dbx.sharing_create_shared_link_with_settings(res.path_lower)
        except ApiError as e:
            if isinstance(e.error, CreateSharedLinkWithSettingsError) and e.error.is_shared_link_already_exists():
                links = dbx.sharing_list_shared_links(path=res.path_lower, direct_only=True).links
                shared_link_metadata = links[0]
            else:
                raise e

        url_publica = (
            shared_link_metadata.url
            .replace("www.dropbox.com", "dl.dropboxusercontent.com")
            .replace("?dl=0", "")
        )
        return url_publica
    except Exception as e:
        # Fallback para desarrollo sin romper la aplicación
        return f"/uploads{nombre_destino}"


def descargar_de_dropbox(nombre_dropbox: str, nombre_local: str):
    """
    Descarga un archivo desde Dropbox a tu sistema local.
    """
    dbx = _get_dropbox_client()
    metadata, res = dbx.files_download(nombre_dropbox)
    with open(nombre_local, "wb") as f:
        f.write(res.content)