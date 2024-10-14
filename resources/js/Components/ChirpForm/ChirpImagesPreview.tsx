import React, { useMemo } from "react";
import { maxImagesCount } from "./utils";
import MaximizeIcon from "../Icons/MaximizeIcon";
import XIcon from "../Icons/XIcon";
import CircleCheckIcon from "../Icons/CircleCheckIcon";
import AnimatedLoadingCircle from "../Icons/AnimatedLoadingCircle";

export default function ChirpImagesPreview({
    images,
    fileKeys,
    onRemoveImage,
    onMaximizeImage,
    onClearAll,
    imageListChildren,
    processing,
    processingPercentages,
}: {
    images: File[];
    fileKeys: string[];
    onRemoveImage: (index: number) => void;
    onMaximizeImage: (index: number) => void;
    onClearAll: () => void;
    imageListChildren?: React.ReactElement[];
    processing?: boolean;
    processingPercentages?: number[];
}) {
    const previewImages = useMemo(() => {
        return images ? images.map((file) => URL.createObjectURL(file)) : [];
    }, [images]);

    return (
        <div className="mt-2">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {imageListChildren}
                {previewImages.map((img, i) => (
                    <ChirpPreviewImage
                        key={fileKeys[i]}
                        src={img}
                        loadedPercentage={
                            processing && !!processingPercentages
                                ? processingPercentages[i]
                                : undefined
                        }
                        onRemove={() => onRemoveImage(i)}
                        onMaximize={() => onMaximizeImage(i)}
                    />
                ))}
            </div>
            <div className="flex justify-between items-center">
                <small className="text-gray-400">
                    {previewImages.length +
                        (imageListChildren ? imageListChildren.length : 0)}
                    /{maxImagesCount} images
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

export function ChirpPreviewImage({
    src,
    loadedPercentage,
    onRemove,
    onMaximize,
}: {
    src: string;
    loadedPercentage?: number;
    onRemove: () => void;
    onMaximize: () => void;
}) {
    const isLoading = loadedPercentage !== undefined;

    return (
        <div className="w-28 h-28 rounded-lg overflow-hidden relative group">
            <img
                width={112}
                height={112}
                src={src}
                alt="Preview"
                className="object-cover w-full h-full"
                style={{
                    overflowClipMargin: "unset",
                }}
            />
            {!isLoading ? (
                <div className="bg-black/40 absolute inset-0 hidden group-hover:flex justify-center items-center gap-4">
                    <button
                        className="p-1 bg-white/75 hover:bg-white/80 active:bg-white/90 rounded-lg transition-colors"
                        type="button"
                        onClick={onMaximize}
                    >
                        <MaximizeIcon className="w-6 h-6 text-black" />
                    </button>
                    <button
                        className="p-1 bg-white/75 hover:bg-white/80 active:bg-white/90 rounded-lg transition-colors"
                        type="button"
                        onClick={onRemove}
                    >
                        <XIcon className="w-6 h-6 text-black" />
                    </button>
                </div>
            ) : isLoading && loadedPercentage < 100 ? (
                <div className="absolute inset-0 bg-slate-400/40 flex justify-center items-center">
                    <AnimatedLoadingCircle
                        percentage={Math.max(loadedPercentage, 1)}
                        thikness={8}
                        className="w-14 h-14 animate-spin"
                    />
                </div>
            ) : (
                <div className="bg-black/40 absolute inset-0 flex justify-center items-center">
                    <CircleCheckIcon className="text-green-500 w-14 h-14" />
                </div>
            )}
        </div>
    );
}
