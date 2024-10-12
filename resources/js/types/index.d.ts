import { Config } from "ziggy-js";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface UserPreview {
    id: number;
    name: string;
    created_at: string;
}

export interface Chirp {
    id: number;
    user_id: number;
    message: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
    };
    media: { id: number; mime: string; url: string }[];
    likes_count: number;
    is_liked: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
};

export type PagedData<T> = {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    links: {
        url: string | null;
        active: boolean;
        label: string;
    }[];
};

export type SimplePagedData<T> = {
    current_page: number;
    data: T[];
    from: number;
    to: number;
    per_page: number;
    first_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type CursorPagedData<T> = {
    data: T[];
    per_page: number;
    path: string;
    next_cursor: string | null;
    next_page_url: string | null;
    prev_cursor: string | null;
    prev_page_url: string | null;
};
