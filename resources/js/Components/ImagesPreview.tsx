import { useEffect, useState } from "react";
import Modal from "./Modal";

interface Props {
    urls: string[];
    startFromIndex?: number;
    modal: {
        show: boolean;
        onClose: CallableFunction;
    };
}

interface ComponentProps extends Omit<Props, "startFromIndex"> {
    currentIndex: number;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export default function ImagesPreview(props: Props) {
    const [currentIndex, setCurrentIndex] = useState(() =>
        Math.min(
            props.startFromIndex !== undefined && props.startFromIndex > 0
                ? props.startFromIndex
                : 0,
            props.urls.length
        )
    );

    return (
        <Modal
            show={props.modal.show}
            onClose={props.modal.onClose}
            closeable
            maxWidth="full"
        >
            <ImagesPreviewComponent urls={props.urls} modal={props.modal} />
        </Modal>
    );
}

const leftCodes = ["ArrowLeft", "KeyA", "Numpad4"];
const rightCodes = ["ArrowRight", "KeyD", "Numpad6"];

function ImagesPreviewComponent(props: ComponentProps) {
    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if (leftCodes.includes(e.code)) {
                props.hasPrev && props.onPrev();
            } else if (rightCodes.includes(e.code)) {
                props.hasNext && props.onNext();
            } else if (e.code === "Escape") {
                props.modal.onClose();
            }
        }

        document.addEventListener("keydown", handleKeydown);

        return () => document.removeEventListener("keydown", handleKeydown);
    }, []);

    return (
        <div
            className="w-full h-full flex flex-col items-center"
            onClick={() => props.modal.onClose()}
        >
            <div
                className="w-full max-h-[70%]"
                onClick={(e) => e.stopPropagation()}
            >
                {props.urls.map((url) => (
                    <figure className="max-w-[70%]" key={url}>
                        <img src={url} className="h-full w-full" />
                    </figure>
                ))}
            </div>
        </div>
    );
}
