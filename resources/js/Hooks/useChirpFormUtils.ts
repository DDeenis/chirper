import {
    FormValues,
    getFileKey,
    maxImagesCount,
} from "@/Components/ChirpForm/utils";
import { AxiosProgressEvent } from "axios";
import { useMemo, useState } from "react";

export default function useChirpFormUtils({
    images,
    setData,
    existingFilesCount,
}: {
    images?: File[];
    setData: (field: "images", value?: File[]) => void;
    existingFilesCount?: number;
}) {
    const [progressingPercentages, setProgressingPercentages] = useState<
        number[]
    >([]);

    const fileKeys = useMemo(() => images?.map(getFileKey) ?? [], [images]);

    function onUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
        const { files } = e.target;
        if (files) {
            const currentFiles = images ?? [];
            const currentLength =
                currentFiles.length + (existingFilesCount ?? 0);

            if (currentLength === maxImagesCount) return;

            const filesFiltered = [...files].filter(
                (file) => !fileKeys.includes(getFileKey(file))
            );

            setData("images", [
                ...currentFiles,
                ...filesFiltered.slice(0, maxImagesCount - currentLength),
            ]);

            e.target.value = "";
            e.target.files = null;
        }
    }

    function onRemoveImage(index: number) {
        if (images) {
            const copy = [...images];
            copy.splice(index, 1);
            setData("images", copy);
        }
    }

    function onClearAll() {
        setData("images", undefined);
    }

    function calculateProgressingPercentages(event?: AxiosProgressEvent) {
        if (event && event.lengthComputable) {
            let loaded = event.loaded;

            const percentages = images!.map((img) => {
                if (loaded === 0) return 0;

                const loadedPercentage = (loaded / img.size) * 100;

                if (loadedPercentage >= 100) {
                    loaded -= img.size;
                    return 100;
                } else {
                    loaded = 0;
                    return loadedPercentage;
                }
            });

            setProgressingPercentages(percentages);
        }
    }

    return {
        fileKeys,
        onUploadImage,
        onRemoveImage,
        onClearAll,
        progressingPercentages,
        calculateProgressingPercentages,
    };
}
