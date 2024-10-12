import React from "react";
import { maxMessageLength } from "./utils";

export default function ChirpMessageInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
    const message = value;

    return (
        <>
            <textarea
                value={message}
                placeholder="What's on your mind?"
                className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                onChange={onChange}
            ></textarea>
            <p className="text-right">
                <small
                    className={
                        message.length > maxMessageLength
                            ? "text-red-400"
                            : "text-gray-400"
                    }
                >
                    {message.length}/{maxMessageLength}
                </small>
            </p>
        </>
    );
}
