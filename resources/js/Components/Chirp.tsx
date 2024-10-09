import type { Chirp as ChirpType } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";
import Dropdown from "@/Components/Dropdown";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import { HeartIcon } from "./Icons/HeartIcon";
import clsx from "clsx";

dayjs.extend(relativeTime);

export default function Chirp({
    chirp,
    loggedUserId,
    onEditSuccess,
    onDeleteSuccess,
    onLikeSuccess,
}: {
    chirp: ChirpType;
    loggedUserId?: number;
    onEditSuccess: (edited: ChirpType) => void;
    onDeleteSuccess: (id: number) => void;
    onLikeSuccess: (id: number, isLiked: boolean) => void;
}) {
    const page = usePage();
    const [isEditing, setIsEditing] = useState(false);

    const { createdAt, updatedAt } = useMemo(
        () => ({
            createdAt: dayjs(chirp.created_at),
            updatedAt: dayjs(chirp.updated_at),
        }),
        [chirp]
    );

    const editForm = useForm({
        message: chirp.message,
    });

    const startEdit = () => setIsEditing(true);
    const finishEdit = () => setIsEditing(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.patch(route("chirps.update", chirp.id), {
            onSuccess: () => {
                finishEdit();
                onEditSuccess({ ...chirp, message: editForm.data.message });
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // const handleLike = async () => {
    //     const success: boolean = await fetch(route("like.store"), {
    //         method: "POST",
    //         body: JSON.stringify({
    //             _token: page.props.,
    //             chirp_id: chirp.id,
    //         }),
    //     })
    //         .then((r) => r.json())
    //         .then((r) => r.success);
    //     router.post(route('like', chirp.id), {}, {
    //         preserveScroll: true,
    //         preserveState: true
    //     })

    //     success && onLikeSuccess(chirp.id, !chirp.is_liked);
    // };

    return (
        <div className="p-6 flex flex-col space-y-6">
            <div className="flex space-x-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600 -scale-x-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-center">
                        <div>
                            <Link
                                className="text-gray-800"
                                href={route("user.index", chirp.user.id)}
                            >
                                {chirp.user.name}
                            </Link>
                            <small className="ml-2 text-sm text-gray-600">
                                {createdAt.fromNow()}
                            </small>
                            {!createdAt.isSame(updatedAt) && (
                                <>
                                    <span className="mx-2">&middot;</span>
                                    <small className="text-sm text-gray-400">
                                        edited {updatedAt.fromNow()}
                                    </small>
                                </>
                            )}
                        </div>
                        {chirp.user.id === loggedUserId && (
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <button
                                        className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 transition duration-150 ease-in-out"
                                        onClick={startEdit}
                                    >
                                        Edit
                                    </button>
                                    <Dropdown.Link
                                        as="button"
                                        href={route("chirps.destroy", chirp.id)}
                                        onSuccess={() =>
                                            onDeleteSuccess(chirp.id)
                                        }
                                        preserveScroll
                                        preserveState
                                        method="delete"
                                    >
                                        Delete
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        )}
                    </div>
                    {isEditing ? (
                        <form onSubmit={submit}>
                            <textarea
                                value={editForm.data.message}
                                onChange={(e) =>
                                    editForm.setData("message", e.target.value)
                                }
                                className="mt-4 w-full text-gray-900 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                            ></textarea>
                            <InputError
                                message={editForm.errors.message}
                                className="mt-2"
                            />
                            <div className="space-x-2">
                                <PrimaryButton className="mt-4">
                                    Save
                                </PrimaryButton>

                                <button
                                    className="mt-4"
                                    onClick={() => {
                                        finishEdit();
                                        editForm.reset();
                                        editForm.clearErrors();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-4">
                            <p className="text-lg text-gray-900 whitespace-pre-line text-wrap break-all">
                                {chirp.message}
                            </p>
                            {chirp.media.length > 0 && (
                                <div className="mt-3 w-5/6 max-h-80 grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl overflow-hidden">
                                    {chirp.media.map((media, i) => (
                                        <figure
                                            className={clsx(
                                                "h-full only:col-span-2 only:row-span-2",
                                                chirp.media.length === 2 &&
                                                    "row-span-2",
                                                chirp.media.length === 3 &&
                                                    i === 2 &&
                                                    "col-span-2"
                                            )}
                                            key={i}
                                        >
                                            <img
                                                src={media.url}
                                                className="object-cover h-full"
                                                style={{
                                                    overflowClipMargin: "unset",
                                                }}
                                                width={500}
                                                height={320}
                                            />
                                        </figure>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 bg-gray-100 rounded-xl">
                <div className="flex items-center space-x-2">
                    <Link
                        href={route("like", chirp.id)}
                        as="button"
                        method="post"
                        preserveScroll
                        preserveState
                        only={["errors"]}
                        onSuccess={() =>
                            onLikeSuccess(chirp.id, !chirp.is_liked)
                        }
                    >
                        <HeartIcon
                            className={
                                "w-5 h-5" +
                                (chirp.is_liked ? " fill-red-600" : "")
                            }
                        />
                    </Link>
                    <span>{chirp.likes_count}</span>
                </div>
            </div>
        </div>
    );
}
