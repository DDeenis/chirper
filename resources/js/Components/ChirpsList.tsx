import { Chirp as ChirpType } from "@/types";
import Chirp from "./Chirp";
import SecondaryButton from "./SecondaryButton";
import { useEffect, useRef } from "react";

export default function ChirpsList({
    chirps,
    loggedUserId,
    hasNext,
    onLoadMore,
    onChirpEditSuccess,
    onChirpDeleteSuccess,
    onChirpLikeSuccess,
}: {
    chirps: ChirpType[];
    hasNext?: boolean;
    loggedUserId?: number;
    onLoadMore?: () => void;
    onChirpEditSuccess: (edited: ChirpType) => void;
    onChirpDeleteSuccess: (id: number) => void;
    onChirpLikeSuccess: (id: number, isLiked: boolean) => void;
}) {
    const loadMoreRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver((entries) =>
            entries.forEach((entry) => entry.isIntersecting && onLoadMore?.(), {
                rootMargin: "-150px 0px 0px 0px",
            })
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="mt-6">
            <div className="bg-white shadow-sm rounded-lg divide-y">
                {chirps.map((chirp) => (
                    <Chirp
                        key={chirp.id}
                        chirp={chirp}
                        loggedUserId={loggedUserId}
                        onEditSuccess={onChirpEditSuccess}
                        onDeleteSuccess={onChirpDeleteSuccess}
                        onLikeSuccess={onChirpLikeSuccess}
                    />
                ))}
            </div>
            {/* <span ref={loadMoreRef} /> */}
            {/* {hasNext && <span ref={loadMoreRef} />} */}
            {hasNext && (
                <div className="flex justify-center items-center mt-4">
                    <SecondaryButton onClick={onLoadMore}>
                        Load more
                    </SecondaryButton>
                </div>
            )}
        </div>
    );
}
