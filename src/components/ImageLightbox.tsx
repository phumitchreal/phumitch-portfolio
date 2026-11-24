import React, { useEffect } from "react";
import { XIcon as X } from "@phosphor-icons/react";

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid size-10 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={20} weight="bold" />
      </button>
      <div
        className="flex max-h-full max-w-[min(1200px,94vw)] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[86vh] w-auto max-w-full rounded-[10px] object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}
