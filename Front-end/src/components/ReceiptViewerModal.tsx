import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { fetchReceipt, getFileType, createDownloadLink } from "@/utils/receiptUtils";
import { toast } from "sonner";

interface ReceiptViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number;
  transactionName: string;
}

export const ReceiptViewerModal = ({
  open,
  onOpenChange,
  transactionId,
  transactionName,
}: ReceiptViewerModalProps) => {
  const [loading, setLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'unknown'>('unknown');
  const [zoom, setZoom] = useState(100);
  const [receiptBlob, setReceiptBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (open) {
      loadReceipt();
    } else {
      // Cleanup
      if (receiptUrl) {
        URL.revokeObjectURL(receiptUrl);
      }
      setReceiptUrl(null);
      setFileType('unknown');
      setZoom(100);
      setReceiptBlob(null);
    }
  }, [open, transactionId]);

  const loadReceipt = async () => {
    setLoading(true);
    try {
      const blob = await fetchReceipt(transactionId);
      setReceiptBlob(blob);
      const url = URL.createObjectURL(blob);
      setReceiptUrl(url);
      const type = getFileType(blob.type);
      setFileType(type);
      
      if (type === 'unknown') {
        toast.error('Formato de arquivo não suportado');
      }
    } catch (error) {
      console.error('Erro ao carregar comprovante:', error);
      toast.error('Erro ao carregar comprovante');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (receiptBlob) {
      const extension = fileType === 'pdf' ? 'pdf' : 'jpg';
      createDownloadLink(receiptBlob, `comprovante-${transactionName}.${extension}`);
      toast.success('Comprovante baixado com sucesso');
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Comprovante de Pagamento</DialogTitle>
          <DialogDescription>
            Transação: {transactionName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border pb-4">
          {fileType === 'image' && (
            <>
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!receiptUrl}>
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </div>

        <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : receiptUrl && fileType === 'image' ? (
            <div className="flex justify-center">
              <img
                src={receiptUrl}
                alt="Comprovante"
                style={{ width: `${zoom}%` }}
                className="max-w-none rounded-lg shadow-lg"
              />
            </div>
          ) : receiptUrl && fileType === 'pdf' ? (
            <iframe
              src={receiptUrl}
              className="w-full h-full min-h-[600px] rounded-lg"
              title="Comprovante PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum comprovante disponível
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
