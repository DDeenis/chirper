import { Chirp } from "@/types";
import { useForm } from "@inertiajs/react";
import InputError from "./InputError";
import PrimaryButton from "./PrimaryButton";
import ChirpMessageInput from "./ChirpForm/ChirpMessageInput";
import ChirpImagesPreview, {
    ChirpPreviewImage,
} from "./ChirpForm/ChirpImagesPreview";
import ChirpToolbar from "./ChirpForm/ChirpToolbar";
import type { FormValues } from "./ChirpForm/utils";
import useChirpFormUtils from "@/Hooks/useChirpFormUtils";
import { useMemo } from "react";

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

    const existingImagesPreview = useMemo(
        () =>
            chirp.media
                .filter((img) => !data.deleted_images_ids?.includes(img.id))
                .map((img) => (
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
        </form>
    );
}
