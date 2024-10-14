import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import type { Chirp, CursorPagedData, User } from "@/types";
import ChirpsList from "@/Components/ChirpsList";
import { CreateChirpForm } from "@/Components/ChirpForm/CreateChirpForm";
import { useChirpFeed } from "@/Hooks/useChirpFeed";

interface Props {
    auth: { user: User };
    chirps: CursorPagedData<Chirp>;
}

export default function Index({ auth, chirps }: Props) {
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
    console.log(chirps.data);

    const hasNext = chirps.next_page_url !== null;

    return (
        <AuthenticatedLayout>
            <Head title="Chirps" />
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <CreateChirpForm onChirpCreated={onCreateSuccess} />
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
