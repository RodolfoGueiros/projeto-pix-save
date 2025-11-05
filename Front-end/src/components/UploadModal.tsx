// src/components/UploadModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { pagamentoAPI } from "@/services/api";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

export const UploadModal = ({ open, onOpenChange, onUploadSuccess }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Formato de arquivo não suportado. Use PDF, JPG ou PNG.");
        return;
      }
      
      // Validar tamanho (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    setIsUploading(true);
    
    try {
      const response = await pagamentoAPI.uploadComprovante(file);
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{response}</span>
        </div>
      );
      
      // Limpar e fechar modal
      setFile(null);
      onOpenChange(false);
      
      // Aguardar um pouco e atualizar lista
      setTimeout(() => {
        onUploadSuccess();
      }, 200);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao processar comprovante. Verifique o formato do arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Insira o comprovante PIX</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo do Comprovante</Label>
            <div className="space-y-3">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                className="cursor-pointer"
                disabled={isUploading}
              />
              
              {file && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Dica
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              O sistema irá extrair automaticamente as informações do comprovante:
              Nome do pagador, Banco, Valor, Data e Hora.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || !file}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Enviar e Processar</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};