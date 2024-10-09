import ChirpsList from "@/Components/ChirpsList";
import { CreateChirpForm } from "@/Components/CreateChirpForm";
import { useChirpFeed } from "@/Hooks/useChirpFeed";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { Chirp, CursorPagedData, User, UserPreview } from "@/types";
import { Head, router } from "@inertiajs/react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

interface Props {
    auth: { user: User };
    viewedUser: UserPreview;
    chirps: CursorPagedData<Chirp>;
}

export default function Index({ auth, viewedUser, chirps }: Props) {
    const {
        chirpsData,
        onLoadMore,
        onCreateSuccess,
        onEditSuccess,
        onDeleteSuccess,
        onLikeToggle,
    } = useChirpFeed({
        initialState: chirps.data,
        next_page_url: chirps.next_page_url,
    });

    const [elementDate, displayedDate] = useMemo(() => {
        const registeredAt = dayjs(viewedUser.created_at);
        return [
            registeredAt.format("YYYY-MM-DD"),
            registeredAt.format("DD.MM.YYYY"),
        ];
    }, [viewedUser.created_at]);

    const isCurrentUser = auth.user.id === viewedUser.id;
    const hasNext = chirps.next_page_url !== null;

    return (
        <AuthenticatedLayout>
            <Head title={`${viewedUser.name} | Profile`} />
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex gap-4">
                    <div className="w-24 h-24 select-none rounded-full bg-gray-200 text-gray-500 text-3xl flex justify-center items-center">
                        {stringAvatar(viewedUser.name)}
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-gray-600 text-lg">
                            {viewedUser.name}
                        </p>
                        <small className="text-gray-400 text-sm">
                            Registered at{" "}
                            <time dateTime={elementDate}>{displayedDate}</time>
                        </small>
                    </div>
                </div>
                {isCurrentUser && (
                    <div className="mt-6">
                        <CreateChirpForm onChirpCreated={onCreateSuccess} />
                    </div>
                )}
                <ChirpsList
                    chirps={chirpsData}
                    loggedUserId={auth.user.id}
                    hasNext={hasNext}
                    onLoadMore={onLoadMore}
                    onChirpEditSuccess={onEditSuccess}
                    onChirpDeleteSuccess={onDeleteSuccess}
                    onChirpLikeSuccess={onLikeToggle}
                />
            </div>
        </AuthenticatedLayout>
    );
}

function stringAvatar(fullName: string) {
    const parts = fullName.split(" ");
    let avatar = "";
    for (let i = 0; i < Math.min(parts.length, 2); i++) {
        avatar += parts[i][0].toUpperCase();
    }
    return avatar;
}
