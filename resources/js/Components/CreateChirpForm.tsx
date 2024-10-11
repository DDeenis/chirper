import { PageProps } from "@/types";
import { useForm } from "@inertiajs/react";
import InputError from "./InputError";
import PrimaryButton from "./PrimaryButton";
import PaperclipIcon from "./Icons/PaperclipIcon";
import { useMemo } from "react";
import ImagesPreview from "./ChirpForm/ImagesPreview";
import { getFileKey } from "./ChirpForm/utils";

interface FormValues {
    message: string;
    images?: File[];
}

const maxImagesCount = 4;

export function CreateChirpForm({
    onChirpCreated,
}: {
    onChirpCreated: (data: PageProps) => void;
}) {
    const maxMessageLength = 250;
    const { data, setData, post, processing, reset, errors } =
        useForm<FormValues>({
            message: "",
        });

    const fileKeys = useMemo(
        () => data.images?.map(getFileKey) ?? [],
        [data.images]
    );

    function onUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
        const { files } = e.target;
        if (files) {
            const currentFiles = data.images ?? [];

            if (currentFiles.length === maxImagesCount) return;

            const filesFiltered = [...files].filter(
                (file) => !fileKeys.includes(getFileKey(file))
            );

            setData("images", [
                ...currentFiles,
                ...filesFiltered.slice(0, maxImagesCount - currentFiles.length),
            ]);

            e.target.value = "";
            e.target.files = null;
        }
    }

    function onRemoveImage(index: number) {
        if (data.images) {
            const copy = [...data.images];
            copy.splice(index, 1);
            setData("images", copy);
        }
    }

    function onClearAll() {
        setData("images", undefined);
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("chirps.store"), {
            only: ["created_chirp"],
            onSuccess: (data) => {
                onChirpCreated(data.props);
                reset();
            },
        });
    };

    return (
        <form onSubmit={submit}>
            <div>
                <textarea
                    value={data.message}
                    placeholder="What's on your mind?"
                    className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                    onChange={(e) => setData("message", e.target.value)}
                ></textarea>
                <p className="text-right">
                    <small
                        className={
                            data.message.length > maxMessageLength
                                ? "text-red-400"
                                : "text-gray-400"
                        }
                    >
                        {data.message.length}/{maxMessageLength}
                    </small>
                </p>
                {!!data.images && data.images.length > 0 && (
                    <ImagesPreview
                        images={data.images}
                        fileKeys={fileKeys}
                        onRemoveImage={onRemoveImage}
                        onClearAll={onClearAll}
                    />
                )}
            </div>
            <InputError
                message={errors.message || errors.images}
                className="mt-2"
            />
            <div className="mt-4 flex justify-between items-center">
                <PrimaryButton disabled={processing}>Chirp</PrimaryButton>
                <div className="flex items-center space-x-2">
                    <button className="relative w-8 h-8 cursor-pointer">
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            multiple
                            onChange={onUploadImage}
                            className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        />
                        <PaperclipIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer" />
                    </button>
                </div>
            </div>
        </form>
    );
}
