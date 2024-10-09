<?php

class File
{
    public function __construct(
        public readonly string $name,
        public readonly string $originalName,
        public readonly string $mimeType,
        public readonly string $path,
        public readonly string $disk,
        public readonly string $fileHash,
        public readonly string|null $collection,
        public readonly int $size,
    ) {}

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'file_name' => $this->originalName,
            'mime_type' => $this->mimeType,
            'path' => $this->path,
            'disk' => $this->disk,
            'file_hash' => $this->fileHash,
            'collection' => $this->collection,
            'size' => $this->size,
        ];
    }
}