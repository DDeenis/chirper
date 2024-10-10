import { Chirp, PageProps } from "@/types";
import { useForm } from "@inertiajs/react";
import InputError from "./InputError";
import PrimaryButton from "./PrimaryButton";
import PaperclipIcon from "./Icons/PaperclipIcon";
import { useMemo, useState } from "react";
import XIcon from "./Icons/XIcon";
import MaximizeIcon from "./Icons/MaximizeIcon";

interface FormValues {
    message: string;
    images?: File[];
}

const getFileKey = (file: File) => `${file.name}_${file.size}`;

const maxImagesCount = 4;
const maxMessageLength = 250;

export function EditChirpForm({
    chirp,
    onChirpEdited,
}: {
    chirp: Chirp;
    onChirpEdited: (newChirp: Chirp) => void;
}) {
    const { data, setData, patch, reset, errors, clearErrors, processing } =
        useForm<FormValues>({
            message: chirp.message,
        });

    const [isEditing, setIsEditing] = useState(false);

    const startEdit = () => setIsEditing(true);
    const finishEdit = () => setIsEditing(false);

    const previewImages = useMemo(() => {
        return data.images
            ? data.images.map((file) => URL.createObjectURL(file))
            : [];
    }, [data.images]);
    const fileKeys = useMemo(
        () => data.images?.map(getFileKey) ?? [],
        [data.images]
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route("chirps.update", chirp.id), {
            onSuccess: () => {
                finishEdit();
                onChirpEdited({ ...chirp, ...data });
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit}>
            <div>
                <textarea
                    value={data.message}
                    placeholder="Write something else..."
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
                {previewImages.length > 0 && (
                    <div className="mt-2">
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
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
                                            onClick={() => {
                                                const imagesCopy = [
                                                    ...data.images!,
                                                ];
                                                imagesCopy.splice(i, 1);
                                                setData("images", imagesCopy);
                                            }}
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
                                onClick={() => setData("images", undefined)}
                            >
                                <small>Clear all</small>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <InputError
                message={errors.message || errors.images}
                className="mt-2"
            />
            <div className="mt-4 flex justify-between items-center">
                <div className="space-x-2">
                    <PrimaryButton className="mt-4" disabled={processing}>
                        Save
                    </PrimaryButton>

                    <button
                        className="mt-4"
                        onClick={() => {
                            finishEdit();
                            reset();
                            clearErrors();
                        }}
                        disabled={processing}
                    >
                        Cancel
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="relative w-8 h-8 cursor-pointer">
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            multiple
                            onChange={(e) => {
                                const { files } = e.target;
                                if (files) {
                                    const currentFiles = data.images ?? [];

                                    if (currentFiles.length === maxImagesCount)
                                        return;

                                    const filesFiltered = [...files].filter(
                                        (file) =>
                                            !fileKeys.includes(getFileKey(file))
                                    );

                                    setData("images", [
                                        ...currentFiles,
                                        ...filesFiltered.slice(
                                            0,
                                            maxImagesCount - currentFiles.length
                                        ),
                                    ]);

                                    e.target.value = "";
                                    e.target.files = null;
                                }
                            }}
                            className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        />
                        <PaperclipIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer" />
                    </button>
                </div>
            </div>
        </form>
    );
}
