export const fetchReceipt = async (transactionId: number): Promise<Blob> => {
  const response = await fetch(`http://localhost:8080/api/pagamentos/${transactionId}/comprovante`);
  
  if (!response.ok) {
    throw new Error('Erro ao carregar comprovante');
  }
  
  return await response.blob();
};

export const getFileType = (contentType: string): 'image' | 'pdf' | 'unknown' => {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType === 'application/pdf') return 'pdf';
  return 'unknown';
};

export const createDownloadLink = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
