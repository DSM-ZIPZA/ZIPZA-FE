import type { Property } from "@/shared/types";
import { formatPrice, formatArea, formatPhone } from "@/shared/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { MapPin, Phone, X } from "lucide-react";

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyDetailModal({
  property,
  isOpen,
  onClose,
}: PropertyDetailModalProps) {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between">
            <span>{property.title}</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 가격 */}
          <div className="text-2xl font-bold text-black">
            {formatPrice(property.price)}
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-100 rounded text-center">
              <p className="text-xs text-gray-600">면적</p>
              <p className="font-bold text-black">
                {formatArea(property.area)}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded text-center">
              <p className="text-xs text-gray-600">방</p>
              <p className="font-bold text-black">{property.rooms}개</p>
            </div>
            <div className="p-3 bg-gray-100 rounded text-center">
              <p className="text-xs text-gray-600">층수</p>
              <p className="font-bold text-black">{property.floor}층</p>
            </div>
          </div>

          {/* 주소 */}
          <div className="flex gap-2 p-3 bg-gray-100 rounded">
            <MapPin className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">주소</p>
              <p className="font-semibold text-black text-sm">
                {property.address}
              </p>
            </div>
          </div>

          {/* 설명 */}
          <div>
            <p className="text-xs text-gray-600 mb-2">설명</p>
            <p className="text-sm text-gray-700">{property.description}</p>
          </div>

          {/* 특징 */}
          {property.features.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">특징</p>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-200 text-black rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 연락처 정보 */}
          <div className="pt-4 border-t border-gray-200">
            <p className="font-semibold text-black mb-2">
              {property.contact.name}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {formatPhone(property.contact.phone)}
            </p>
            <Button
              className="w-full bg-black hover:bg-gray-800 text-white"
              onClick={() => {
                window.location.href = `tel:${property.contact.phone}`;
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              전화하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
