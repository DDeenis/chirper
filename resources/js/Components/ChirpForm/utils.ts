export const getFileKey = (file: File) => `${file.name}_${file.size}`;

export const maxImagesCount = 4;
export const maxMessageLength = 250;

export interface FormValues {
    message: string;
    images?: File[];
}
