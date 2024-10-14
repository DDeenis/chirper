import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Dialog, DialogPanel } from "@headlessui/react";

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

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}

export default function ImagesPreview(props: Props) {
    const [currentIndex, setCurrentIndex] = useState(() =>
        props.startFromIndex !== undefined
            ? clamp(props.startFromIndex, 0, props.urls.length - 1)
            : 0
    );

    const hasNext = (index: number) => index < props.urls.length - 1;
    const hasPrev = (index: number) => index > 0;

    function onNext() {
        setCurrentIndex((index) => (hasNext(index) ? index + 1 : index));
    }
    function onPrev() {
        if (!hasPrev) return;
        setCurrentIndex((index) => (hasPrev(index) ? index - 1 : index));
    }

    useEffect(() => {
        props.startFromIndex !== undefined &&
            setCurrentIndex(
                clamp(props.startFromIndex, 0, props.urls.length - 1)
            );
    }, [props.startFromIndex]);

    return (
        <Dialog
            open={props.modal.show}
            onClose={() => props.modal.onClose()}
            className="relative z-50"
        >
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-gray-500/75">
                <DialogPanel className="max-w-lg space-y-4 border overflow-hidden border-none">
                    <ImagesPreviewComponent
                        urls={props.urls}
                        modal={props.modal}
                        currentIndex={currentIndex}
                        hasNext={hasNext(currentIndex)}
                        hasPrev={hasPrev(currentIndex)}
                        onNext={onNext}
                        onPrev={onPrev}
                    />
                </DialogPanel>
            </div>
        </Dialog>
    );
}

const leftCodes = ["ArrowLeft", "KeyA", "Numpad4"];
const rightCodes = ["ArrowRight", "KeyD", "Numpad6"];

function ImagesPreviewComponent(props: ComponentProps) {
    const currentImage = props.urls[props.currentIndex]!;

    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if (leftCodes.includes(e.code)) {
                props.onPrev();
            } else if (rightCodes.includes(e.code)) {
                props.onNext();
            } else if (e.code === "Escape") {
                props.modal.onClose();
            }
        }

        const abortController = new AbortController();

        document.addEventListener("keydown", handleKeydown, {
            signal: abortController.signal,
        });

        return () => abortController.abort();
    }, []);

    return <img src={currentImage} className="max-h-[70vh] object-contain" />;
}
