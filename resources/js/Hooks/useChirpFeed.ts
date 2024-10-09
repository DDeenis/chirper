import { Chirp, CursorPagedData, PageProps } from "@/types";
import { router } from "@inertiajs/react";
import { useState } from "react";

export function useChirpFeed({
    initialState,
    next_page_url,
}: {
    initialState: Chirp[];
    next_page_url: string | null;
}) {
    const [chirpsData, setChirpsData] = useState(initialState);

    const onLoadMore = () => {
        if (next_page_url === null) return;
        router.visit(next_page_url, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ["chirps"],
            onSuccess(data) {
                const props = data.props as unknown as {
                    chirps: CursorPagedData<Chirp>;
                };
                setChirpsData([...chirpsData, ...props.chirps.data]);

                // preserve url
                const url = new URL(location.href);
                url.searchParams.delete("cursor");
                history.replaceState({}, "", url);
            },
        });
    };

    const onCreateSuccess = (data: PageProps) => {
        const createdChirp = data.created_chirp as Chirp | null;
        if (!createdChirp) return;
        setChirpsData((current) => [createdChirp, ...current]);
    };
    const onEditSuccess = (edited: Chirp) =>
        setChirpsData((current) =>
            current.map((c) => (c.id === edited.id ? edited : c))
        );
    const onDeleteSuccess = (id: number) =>
        setChirpsData((current) => current.filter((c) => c.id !== id));
    const onLikeToggle = (id: number, isLiked: boolean) =>
        setChirpsData((current) =>
            current.map((c) =>
                c.id === id
                    ? {
                          ...c,
                          is_liked: isLiked,
                          likes_count: isLiked
                              ? c.likes_count + 1
                              : c.likes_count - 1,
                      }
                    : c
            )
        );

    return {
        chirpsData,
        onLoadMore,
        onCreateSuccess,
        onEditSuccess,
        onDeleteSuccess,
        onLikeToggle,
    };
}
