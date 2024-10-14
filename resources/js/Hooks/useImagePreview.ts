import { useState } from "react";

export default function useImagePreview() {
    const [startPreviewFrom, setStartPreviewFrom] = useState<number>();
    const isOpen = startPreviewFrom !== undefined;

    const openPreview = (from: number) => setStartPreviewFrom(from);
    const closePreview = () => setStartPreviewFrom(undefined);

    return {
        isOpen,
        startPreviewFrom,
        openPreview,
        closePreview,
    };
}
