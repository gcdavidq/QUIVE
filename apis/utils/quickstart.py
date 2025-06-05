from dropbox.exceptions import ApiError
from dropbox.files import WriteMode
from dropbox.sharing import CreateSharedLinkWithSettingsError
import dropbox
from typing import BinaryIO

def subir_a_dropbox(file: BinaryIO, nombre_destino: str):
    TOKEN = 'sl.u.AFzyqqxOBYC_VeJLHRi4GLZe-53RF-pz_TBGs4vTC0wfyUWy-7KhNySZJqLwHqfONPfYxjulIluO09YpGtCrOAFuwprkCRNvksVNrYbIA2IJY8JIJA9WXCSUMCpuWqCKn60oa70s34tb8Mq89vSwyeoAXh3Ehx3BHtDToAJmGauUYG_tJHNG8axErvr3pZCMKn7WMAWmEd6sDpOy-VUtNjCtZpnT4bd9ysu1AqKjuxylzny1Wx7CzikqPMsmvsHeZVjhNtGbTvoTyskZMXyl5o55ND7ficYaSmx8J0a8zAXIqUJmTX_mPNh9KEg4AWuEI-an5kOpM_AMRdQhvy3a6zBS-3BI0ctogoY7K_wsWCFKqwI_JzQmWt3KWyw6JBRGxq-zxs9UMlkaYTtOzLBrDZGHaa7EfVG0uTFqBs-ASf3G8K0QyOcXfBmYJ3OcqtGuPLHzwImnUWZWbwBRgxZ9qN_GmzQPIBZYteYruIz3r8-eafj1DdFpauZX8PZdLATtpXOigx4elgVjtqiBie1DwiiB8E8B5U9toA0lt3ZivHNgbH8T2ToOYUW_N9X0jyDbbx2OyyeJErf3kEcQM8LcZKO-PG_vpjQLQ8tMernrzlYwjkoJi6mwiw7XePBNfB_D3LYJ5ZClRLs2HCes0lGKPQJvBrMO-7poQ7qwLCTL_4e8HXHganen0Vq1n7GUzdZlKBYQvhGYe8rxjiIrMVaYMwY3kEP_Z_C5PN6fo9mTMOSx1j2xyna6wM1iDo-ZygVBWdFAOYJXyuP9o4vQH9aMp0aOU70N-Jtb6APrGFlwiMFmWVTfbQ9M-8ZmF27jYYWU5kstV67qhDmiXdy-1FF8a0Ny7ShOUHEflAs6ih5Qgm2Wrq-RD-n6lDIu2uFWRYnQAw5gDXD_SS2P8RVrG6rq8z0P8-LNgHdvIbUE73W29XlkL1HzbDRdNh5EGMXwS1khD8TJTphp41_r2lFNf6bJJF0wz2ClDv84iDmtPMq8A-HGcQAeiNqMhc0ja1tjl_sdvao4Ex5sRn2t3vEH4hLTe02kJ-1YeG8vz1ylBKB67p-W2B0nDt70Bs2g0V1sc9VfO1SVajV5FDUIzG-A1_vSoq9HewefFg5u1LXzkHwkAZWOciT0QtZmrshHu4Hr9Z6Swti4Rdr3Vb7w8Wrby1D7QDuyg-1Q-gNJVoIKHGPgUqeqsjZmV5N_Mdi0uE2-YGWN2qxVNyRntOAkzRqo_mRFCFZrxu5dW5JVn4AGTRYy8P9WAqOJuDk4PQVAUM4T9xm3k-GV5uK140UOGaBAbtMSfS-kfgRZIoPJPAlb3eQosLf5RYMQKM_ILF9tULTAFX0GGtw2zHCmHxYNyejN4C8wGXcizhbB162aij_gs_Jksv_j0YVK1YObBezXPqTvtOtqQV_6mtCc7PNFDKFBxWj9_WiJFVy-El98AZlu7lli5XZRFA'
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

        # Convertir a enlace "raw" para mostrar la imagen directamente
        url_publica = shared_link_metadata.url.replace("?dl=0", "?raw=1")
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