"""
Embedding-based semantic search service.
Uses sentence-transformers to create embeddings and FAISS as the vector store.
The index and metadata are persisted to disk so they survive restarts.
"""
from __future__ import annotations

import json
import os
import numpy as np
from pathlib import Path
from typing import List, Tuple

import faiss
from sentence_transformers import SentenceTransformer

from app.core.config import settings

_MODEL_NAME = "all-MiniLM-L6-v2"   # lightweight, 384-dim, runs on CPU
_DIM = 384


class VectorStore:
    """Thin wrapper around a FAISS flat-L2 index with JSON metadata sidecar."""

    def __init__(self):
        self._model: SentenceTransformer | None = None
        self._index: faiss.IndexFlatL2 | None = None
        self._meta: List[dict] = []          # [{doc_id, title, chunk_text}, ...]
        self._loaded = False

    # ── lazy init ────────────────────────────────────────────────────────────
    def _ensure_loaded(self):
        if self._loaded:
            return
        self._model = SentenceTransformer(_MODEL_NAME)
        idx_path = settings.VECTOR_INDEX_PATH
        meta_path = settings.VECTOR_META_PATH

        Path(idx_path).parent.mkdir(parents=True, exist_ok=True)
        Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

        if os.path.exists(idx_path) and os.path.exists(meta_path):
            self._index = faiss.read_index(idx_path)
            with open(meta_path, "r") as f:
                self._meta = json.load(f)
        else:
            self._index = faiss.IndexFlatL2(_DIM)
            self._meta = []

        self._loaded = True

    def _save(self):
        faiss.write_index(self._index, settings.VECTOR_INDEX_PATH)
        with open(settings.VECTOR_META_PATH, "w") as f:
            json.dump(self._meta, f)

    # ── public API ───────────────────────────────────────────────────────────
    def add_document(self, doc_id: int, title: str, text: str):
        """Chunk the document and add embeddings to the index."""
        self._ensure_loaded()
        chunks = self._chunk(text)
        for chunk in chunks:
            vec = self._embed(chunk)
            self._index.add(vec)
            self._meta.append({"doc_id": doc_id, "title": title, "chunk": chunk})
        self._save()

    def remove_document(self, doc_id: int):
        """Rebuild index without the given document (FAISS flat index doesn't support deletion)."""
        self._ensure_loaded()
        remaining = [m for m in self._meta if m["doc_id"] != doc_id]
        self._index = faiss.IndexFlatL2(_DIM)
        self._meta = []
        for item in remaining:
            vec = self._embed(item["chunk"])
            self._index.add(vec)
            self._meta.append(item)
        self._save()

    def search(self, query: str, top_k: int = 5) -> List[Tuple[dict, float]]:
        """Return top_k (meta, distance) pairs for the query."""
        self._ensure_loaded()
        if self._index.ntotal == 0:
            return []
        q_vec = self._embed(query)
        k = min(top_k, self._index.ntotal)
        distances, indices = self._index.search(q_vec, k)
        results = []
        seen_docs = set()
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            meta = self._meta[idx]
            doc_id = meta["doc_id"]
            if doc_id in seen_docs:
                continue
            seen_docs.add(doc_id)
            results.append((meta, float(dist)))
        return results

    # ── helpers ──────────────────────────────────────────────────────────────
    def _embed(self, text: str) -> np.ndarray:
        vec = self._model.encode([text], convert_to_numpy=True, normalize_embeddings=True)
        return vec.astype("float32")

    @staticmethod
    def _chunk(text: str, size: int = 400, overlap: int = 50) -> List[str]:
        words = text.split()
        chunks, i = [], 0
        while i < len(words):
            chunks.append(" ".join(words[i: i + size]))
            i += size - overlap
        return chunks or [text]


# Singleton
vector_store = VectorStore()
