import { PageProps } from "@/types";
import { useForm } from "@inertiajs/react";
import InputError from "../InputError";
import PrimaryButton from "../PrimaryButton";
import ChirpImagesPreview from "../ChirpForm/ChirpImagesPreview";
import type { FormValues } from "../ChirpForm/utils";
import ChirpToolbar from "../ChirpForm/ChirpToolbar";
import ChirpMessageInput from "../ChirpForm/ChirpMessageInput";
import useChirpFormUtils from "@/Hooks/useChirpFormUtils";

export function CreateChirpForm({
    onChirpCreated,
}: {
    onChirpCreated: (data: PageProps) => void;
}) {
    const { data, setData, post, processing, reset, errors } =
        useForm<FormValues>({
            message: "",
        });

    const {
        fileKeys,
        onUploadImage,
        onRemoveImage,
        onClearAll,
        progressingPercentages,
        calculateProgressingPercentages,
    } = useChirpFormUtils({ images: data.images, setData });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("chirps.store"), {
            only: ["created_chirp"],
            onSuccess: (data) => {
                onChirpCreated(data.props);
                reset();
            },
            onProgress: calculateProgressingPercentages,
        });
    };

    return (
        <form onSubmit={submit}>
            <div>
                <ChirpMessageInput
                    value={data.message}
                    onChange={(e) => setData("message", e.target.value)}
                />
                {!!data.images && data.images.length > 0 && (
                    <ChirpImagesPreview
                        images={data.images}
                        fileKeys={fileKeys}
                        onRemoveImage={onRemoveImage}
                        onClearAll={onClearAll}
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
                <PrimaryButton disabled={processing}>Chirp</PrimaryButton>
                <ChirpToolbar onUploadImage={onUploadImage} />
            </div>
        </form>
    );
}
