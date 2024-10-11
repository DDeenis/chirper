import React, { useMemo } from "react";
import { getFileKey, maxImagesCount } from "./utils";
import MaximizeIcon from "../Icons/MaximizeIcon";
import XIcon from "../Icons/XIcon";

export default function ImagesPreview({
    images,
    fileKeys,
    onRemoveImage,
    onClearAll,
    imageListChildren,
}: {
    images: File[];
    fileKeys: string[];
    onRemoveImage: (index: number) => void;
    onClearAll: () => void;
    imageListChildren?: React.ReactNode;
}) {
    const previewImages = useMemo(() => {
        return images ? images.map((file) => URL.createObjectURL(file)) : [];
    }, [images]);

    return (
        <div className="mt-2">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {imageListChildren}
                {previewImages.map((img, i) => (
                    <div
                        className="w-28 h-28 rounded-lg overflow-hidden relative group"
                        key={fileKeys[i]}
                    >
                        <img
                            width={112}
                            height={112}
                            src={img}
                            alt="Preview"
                            className="object-cover w-full h-full"
                            style={{
                                overflowClipMargin: "unset",
                            }}
                        />
                        <div className="bg-black/40 absolute inset-0 hidden group-hover:flex justify-center items-center gap-4">
                            <button
                                className="p-1 bg-white/75 hover:bg-white/80 active:bg-white/90 rounded-lg transition-colors"
                                type="button"
                            >
                                <MaximizeIcon className="w-6 h-6 text-black" />
                            </button>
                            <button
                                className="p-1 bg-white/75 hover:bg-white/80 active:bg-white/90 rounded-lg transition-colors"
                                type="button"
                                onClick={() => onRemoveImage(i)}
                            >
                                <XIcon className="w-6 h-6 text-black" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center">
                <small className="text-gray-400">
                    {previewImages.length}/{maxImagesCount} images
                </small>
                <button
                    type="button"
                    className="text-gray-400 underline font-semibold"
                    onClick={onClearAll}
                >
                    <small>Clear all</small>
                </button>
            </div>
        </div>
    );
}
