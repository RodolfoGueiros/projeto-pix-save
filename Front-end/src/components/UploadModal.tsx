import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

const bancos = [
  "Banco do Brasil",
  "Bradesco",
  "Itaú",
  "Santander",
  "Caixa Econômica Federal",
  "Nubank",
  "Inter",
  "C6 Bank",
  "BTG Pactual",
  "Sicoob",
];

export const UploadModal = ({ open, onOpenChange, onUploadSuccess }: UploadModalProps) => {
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    if (!selectedBank) {
      toast.error("Por favor, selecione um banco");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("banco", selectedBank);

    try {
      const response = await fetch("http://localhost:8080/api/pagamentos/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Comprovante enviado com sucesso!");
        onOpenChange(false);
        onUploadSuccess();
        setFile(null);
        setSelectedBank("");
      } else {
        toast.error("Erro ao enviar comprovante");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Insira o comprovante</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Banco</Label>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger id="bank">
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {bancos.map((banco) => (
                  <SelectItem key={banco} value={banco}>
                    {banco}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*,.pdf"
                className="cursor-pointer"
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || !file || !selectedBank}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
