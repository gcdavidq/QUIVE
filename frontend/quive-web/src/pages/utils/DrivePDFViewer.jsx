const DrivePDFViewer = ({ fileId }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (fileId) {
      const url = `https://drive.google.com/file/d/${fileId}/preview`;
      setPdfUrl(url);
    }
  }, [fileId]);

  return (
    <div>
      {!isLoaded && <p>Cargando PDF...</p>}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          width="100%"
          height="600px"
          onLoad={() => setIsLoaded(true)}
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      )}
    </div>
  );
};
