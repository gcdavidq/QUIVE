from dropbox.exceptions import ApiError
from dropbox.files import WriteMode
from dropbox.sharing import CreateSharedLinkWithSettingsError
import dropbox
from typing import BinaryIO
import requests


def get_access_token(refresh_token, app_key, app_secret):
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
        raise Exception("Error obteniendo access token: " + response.text)

def subir_a_dropbox(file: BinaryIO, nombre_destino: str):
    TOKEN = get_access_token(
        refresh_token='UToFxa2itbkAAAAAAAAAATyp6OE1TLirLtNomCTAPf41iz3WJpKF1Ota4x5fp6K4',
        app_key='sk2ijo2e9u12dbk',
        app_secret='rnm0outftw8l3wh'
    )
    dbx = dropbox.Dropbox(TOKEN)
    """
    Sube un archivo a Dropbox.

    :param file: archivo binario (por ejemplo, de un formulario web)
    :param nombre_destino: ruta de destino en Dropbox (ej. "/miarchivo.pdf")
    """
    try:
        # Subir archivo (modo "add" para evitar sobreescribir)
        res = dbx.files_upload(file.read(), nombre_destino, mode=WriteMode.add)

        try:
            # Intentar crear un nuevo enlace compartido
            shared_link_metadata = dbx.sharing_create_shared_link_with_settings(res.path_lower)
        except ApiError as e:
            # Si ya existe un enlace, lo reutilizamos
            if isinstance(e.error, CreateSharedLinkWithSettingsError) and e.error.is_shared_link_already_exists():
                # Buscar enlaces existentes
                links = dbx.sharing_list_shared_links(path=res.path_lower, direct_only=True).links
                shared_link_metadata = links[0]  # Tomar el primero
            else:
                raise e  # Re-lanzar si el error es otro

        # Convertir la URL a una versión directa (raw) tipo: dl.dropboxusercontent.com/s/...
        url_publica = (
            shared_link_metadata.url
            .replace("www.dropbox.com", "dl.dropboxusercontent.com")
            .replace("?dl=0", "")
        )

        print("Nombre final:", res.name)
        print("Ruta final:", url_publica)
        return url_publica

    except Exception as e:
        print(f"Error al subir archivo: {e}")

# Ejemplo para descargar un archivo
def descargar_de_dropbox(nombre_dropbox: str, nombre_local: str):
    TOKEN = 'sl.u.AFxdflPD28eUTqLF2oO1biiO3LBnNmDCu5y_fGV61C52mhcVUXhxzfRNgyVcLyR4h0eu92Sh1K0ra6MVKOo2aBR6HVFW7GCL5cN34r_gKxPtINpka9exse0ZvU9HVYWrlIM9rQzsZTlu4CSpKz3wLXgKkxKWy_CNcDS77GEPs1jWaimj-NT5jGfYreskc-gXJw3A7S1s2Co_PHCjQ8nlpR3KtleXArrbR5NEUunbq7SnkjLQ4yyu374uAX0_LUF8kqK4rdGo_-UMSIu439OQssz7LW9E6oLZZdKqeFO_kImypTFEXfnJCuSHhMBy5Iz0ckZnk0VROmx3ryh1L29B3ymeFl4kIf8jrghFJTP4RJDBWmV830Y_T8gRLYPKL7EjTYBLXJcQKWDrjcj-QmY7VP9o7xBtnnFwAbcXaL_2uyFZvV56VW3u7gWgD9bgxLH5A5HvwhWX9vshIN2iIttmiG4yTshR7EuHvtukvFb6sTvgyd978dEqxr5oPbK_If7jfQT2DZQd_VNz_dBypWF0HOTZzYsERjoysEi1E2Sz3P6rP48NTa6ckGp67BN3S8z8F2Z59STZMtIvdSYY3ataNIKroUsGInRhKAydeEyp8tFeaAxPmVqRVBFqm4_kDf0l0q1Ey4NYdHJxzpTfdeIJzTP1s_Xh6k6l2F-fZ6rM6SpPP9kzeH6sqnZkeRAt40-sJAQG7CyKEzZVDQGYZVsl4Pz-XI-sp8mIugRehnjM94ArYKGtcQbVXHczKd3CS-dcoSBW1DojUdJbIKu-wBEHSwzzQQiWeeM5Q_5TBxBa2Lj6zPloffdp6ppi8w4xXg48pJ9C5j42D8PdMGuvbq63N2eA7hF_tnoVGb2WpeJjtV0A6fJsAdHdlaJm4Ln4j8B0yQllsqMXmVrMtLGvZ7hd5FprLDJM9VpfHIRXwVtS-1EC6qJJBRAQORCsvz_oPKIpKaebh2BoA2IuX8hOcnE3npKcsQOSR3C_QwJGqEspSIuXgJciuED9wLXzAr2Hi0r1FNivVeEEx5cMqDSLOpaJ3LKdAsst_ISHeoRlq2zgD34Xc3a0et2Fd6f1MoYcOKlG4yPK5cGuR74HqKuuL1xC4FlGZ_8bKGgeWXliQVS1LZ7o4PPynJiFTr-T2ZfdTf5XV94oQ_jk8Xk9nu3IQwjNpuPDwG5EMCS1t_8ObAgcIYeeeY6qnkFOulLupbbbs7pny_f3iAhbvRf_WrTNrP0vMkOMQfME9Br_SuYUYAZnHhX5GWKQPXcZWy7SnxfutZyeQhdkBw3Pj5mabueavIymG7nXPS60zEs5GscRHr8jylEgJA1YCm3uQJSnHuWLqmqljNKGNBwjf0MrKlumCDZzKqyMxm9w0LiK-YDFc5JwJ1V1EpNatfxPG4uauu3Jg1mRUDf9855GVuCkyWMcV5g9YqaEwyhKeaDiBhTbi81m8JuI3Q'
    dbx = dropbox.Dropbox(TOKEN)
    """
    Descarga un archivo desde Dropbox a tu sistema local.

    :param nombre_dropbox: ruta del archivo en Dropbox
    :param nombre_local: nombre del archivo que se guardará localmente
    """
    metadata, res = dbx.files_download(nombre_dropbox)
    with open(nombre_local, "wb") as f:
        f.write(res.content)