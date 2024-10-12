import PaperclipIcon from "../Icons/PaperclipIcon";

export default function ChirpToolbar({
    onUploadImage,
}: {
    onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
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
    );
}
