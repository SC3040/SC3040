import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReceiptResponse } from "@/app/api/receipt/route";

interface EditReceiptPopupProps {
  receipt: ReceiptResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedReceipt: ReceiptResponse) => void;
}

export function EditReceiptPopup({ receipt, isOpen, onClose, onSave }: EditReceiptPopupProps) {
  const [editedReceipt, setEditedReceipt] = useState<ReceiptResponse>(receipt);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedReceipt(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedReceipt);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Receipt</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="merchantName" className="text-right">
              Merchant
            </Label>
            <Input
              id="merchantName"
              name="merchantName"
              value={editedReceipt.merchantName}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={editedReceipt.date.split('T')[0]}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalCost" className="text-right">
              Total Cost
            </Label>
            <Input
              id="totalCost"
              name="totalCost"
              type="number"
              value={editedReceipt.totalCost}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              id="category"
              name="category"
              value={editedReceipt.category}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}