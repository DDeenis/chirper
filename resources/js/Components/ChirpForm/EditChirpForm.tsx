import { Chirp } from "@/types";
import { useForm } from "@inertiajs/react";
import InputError from "../InputError";
import PrimaryButton from "../PrimaryButton";
import ChirpMessageInput from "./ChirpMessageInput";
import ChirpImagesPreview, { ChirpPreviewImage } from "./ChirpImagesPreview";
import ChirpToolbar from "./ChirpToolbar";
import type { FormValues } from "./utils";
import useChirpFormUtils from "@/Hooks/useChirpFormUtils";
import { useMemo } from "react";
import useImagePreview from "@/Hooks/useImagePreview";
import ImagesPreview from "../ImagesPreview";

interface EditFormValues extends FormValues {
    deleted_images_ids?: number[];
}

export function EditChirpForm({
    chirp,
    onCancel,
    onChirpEdited,
}: {
    chirp: Chirp;
    onCancel: () => void;
    onChirpEdited: (newChirp: Chirp) => void;
}) {
    const { data, setData, post, reset, errors, clearErrors, processing } =
        useForm<EditFormValues>({
            message: chirp.message,
        });

    const {
        fileKeys,
        onUploadImage,
        onRemoveImage,
        onClearAll,
        progressingPercentages,
        calculateProgressingPercentages,
    } = useChirpFormUtils({
        images: data.images,
        setData,
        existingFilesCount:
            chirp.media.length - (data.deleted_images_ids?.length ?? 0),
    });

    const imagePreview = useImagePreview();

    const previewUrls = useMemo<string[]>(
        () => [
            ...chirp.media.map((c) => c.url),
            ...(data.images
                ? data.images.map((file) => URL.createObjectURL(file))
                : []),
        ],
        [data.images]
    );

    const existingImagesPreview = useMemo(
        () =>
            chirp.media
                .filter((img) => !data.deleted_images_ids?.includes(img.id))
                .map((img, i) => (
                    <ChirpPreviewImage
                        key={img.url}
                        src={img.url}
                        onRemove={() => {
                            setData(
                                "deleted_images_ids",
                                data.deleted_images_ids
                                    ? [...data.deleted_images_ids, img.id]
                                    : [img.id]
                            );
                        }}
                        onMaximize={() => imagePreview.openPreview(i)}
                    />
                )),
        [chirp.media, data.deleted_images_ids]
    );

    function handleClearAll() {
        onClearAll();
        setData(
            "deleted_images_ids",
            chirp.media.map((img) => img.id)
        );
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // php accept files only through a post request
        post(route("chirps.update", chirp.id), {
            only: ["updated_chirp"],
            onSuccess: (data) => {
                if ("updated_chirp" in data.props) {
                    onChirpEdited(data.props.updated_chirp as Chirp);
                }
            },
            onProgress: calculateProgressingPercentages,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const isPreviewShown =
        (!!data.images && data.images.length > 0) ||
        existingImagesPreview.length > 0;

    return (
        <form onSubmit={submit}>
            <div>
                <ChirpMessageInput
                    value={data.message}
                    onChange={(e) => setData("message", e.target.value)}
                />
                {isPreviewShown && (
                    <ChirpImagesPreview
                        images={data.images ?? []}
                        fileKeys={fileKeys}
                        onRemoveImage={onRemoveImage}
                        onClearAll={handleClearAll}
                        imageListChildren={existingImagesPreview}
                        processing={processing}
                        processingPercentages={progressingPercentages}
                        onMaximizeImage={(index) =>
                            imagePreview.openPreview(
                                index + (chirp.media.length - 1)
                            )
                        }
                    />
                )}
            </div>
            <InputError
                message={errors.message || errors.images}
                className="mt-2"
            />
            <div className="mt-4 flex justify-between items-center">
                <div className="space-x-2 mt-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    <button
                        type="button"
                        onClick={() => {
                            onCancel();
                            reset();
                            clearErrors();
                        }}
                        disabled={processing}
                    >
                        Cancel
                    </button>
                </div>
                <ChirpToolbar onUploadImage={onUploadImage} />
            </div>
            <ImagesPreview
                modal={{
                    show: imagePreview.isOpen,
                    onClose: imagePreview.closePreview,
                }}
                startFromIndex={imagePreview.startPreviewFrom}
                urls={previewUrls}
            />
        </form>
    );
}
