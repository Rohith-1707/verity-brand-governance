"""Evidence retrieval.
Includes:
- TFIDFRetriever: statistical n-gram semantic retrieval using scikit-learn (fast, offline, explainable).
- KeywordRetriever: token-overlap fallback for minimal dependencies.
- ChromaRetriever: persistent vector store for SentenceTransformer embeddings.
"""
from __future__ import annotations
from typing import List, Dict, Any, Optional
from .engine import sentences, tokens


class KeywordRetriever:
    min_score, strong = 0.3, 0.5

    def __init__(self):
        self.items: list[dict] = []

    def index(self, org: str, doc_id: str, title: str, version: str, status: str, effective: Any, review: Any, text: str):
        self.items += [{"org": str(org), "doc": str(doc_id), "title": title, "version": str(version), "status": status,
                        "effective": effective, "review": review, "text": s} for s in sentences(text)]

    def set_status(self, org: str, doc_id: str, status: str):
        for i in self.items:
            if i["org"] == str(org) and i["doc"] == str(doc_id):
                i["status"] = status

    def search(self, org: str, claim: str, status: str, k: int = 3) -> list[dict]:
        ct, out = tokens(claim), []
        for i in self.items:
            if i["org"] == str(org) and i["status"] == status:
                shared = len(ct & tokens(i["text"]))
                if shared >= 2:
                    out.append({**i, "score": shared / max(1, len(ct))})
        return sorted(out, key=lambda h: -h["score"])[:k]


class TFIDFRetriever:
    """Statistical semantic retriever using n-gram TF-IDF and cosine similarity."""
    min_score, strong = 0.25, 0.45

    def __init__(self):
        self.items: list[dict] = []
        self._vectorizer = None
        self._tfidf_matrix = None

    def index(self, org: str, doc_id: str, title: str, version: str, status: str, effective: Any, review: Any, text: str):
        for s in sentences(text):
            self.items.append({
                "org": str(org),
                "doc": str(doc_id),
                "title": title,
                "version": str(version),
                "status": status,
                "effective": effective,
                "review": review,
                "text": s
            })
        self._reindex()

    def set_status(self, org: str, doc_id: str, status: str):
        for i in self.items:
            if i["org"] == str(org) and i["doc"] == str(doc_id):
                i["status"] = status
        self._reindex()

    def _reindex(self):
        if not self.items:
            self._vectorizer = None
            self._tfidf_matrix = None
            return
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            corpus = [it["text"] for it in self.items]
            self._vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words="english")
            self._tfidf_matrix = self._vectorizer.fit_transform(corpus)
        except Exception:
            self._vectorizer = None
            self._tfidf_matrix = None

    def search(self, org: str, claim: str, status: str, k: int = 3) -> list[dict]:
        if not self.items:
            return []
        if self._vectorizer is None or self._tfidf_matrix is None:
            # Fallback to keyword search
            kw = KeywordRetriever()
            kw.items = self.items
            return kw.search(org, claim, status, k)
        try:
            from sklearn.metrics.pairwise import cosine_similarity
            query_vec = self._vectorizer.transform([claim])
            sims = cosine_similarity(query_vec, self._tfidf_matrix)[0]
            
            results = []
            ct = tokens(claim)
            for idx, score in enumerate(sims):
                it = self.items[idx]
                if it["org"] == str(org) and it["status"] == status:
                    # Blend cosine similarity with keyword token overlap for factual grounding
                    shared = len(ct & tokens(it["text"]))
                    bonus = 0.15 if shared >= 2 else 0.0
                    final_score = float(score) + bonus
                    if final_score >= self.min_score:
                        results.append({**it, "score": final_score})
            return sorted(results, key=lambda x: -x["score"])[:k]
        except Exception:
            kw = KeywordRetriever()
            kw.items = self.items
            return kw.search(org, claim, status, k)


class ChromaRetriever:
    """Persistent vector store. One collection per organisation keeps data isolated."""
    min_score, strong = 0.45, 0.65

    def __init__(self, path: str, model: str = "all-MiniLM-L6-v2"):
        import chromadb
        from sentence_transformers import SentenceTransformer
        self.client, self.model = chromadb.PersistentClient(path=path), SentenceTransformer(model)

    def _col(self, org: str):
        return self.client.get_or_create_collection(f"org_{org}", metadata={"hnsw:space": "cosine"})

    def index(self, org: str, doc_id: str, title: str, version: str, status: str, effective: Any, review: Any, text: str):
        ps = sentences(text)
        if ps:
            self._col(org).add(
                ids=[f"{doc_id}:{version}:{n}" for n in range(len(ps))],
                documents=ps,
                embeddings=self.model.encode(ps).tolist(),
                metadatas=[{
                    "doc": str(doc_id),
                    "title": title,
                    "version": str(version),
                    "status": status,
                    "effective": str(effective or ""),
                    "review": str(review or "")
                }] * len(ps)
            )

    def set_status(self, org: str, doc_id: str, status: str):
        col = self._col(org)
        got = col.get(where={"doc": str(doc_id)})
        if got and got.get("ids"):
            col.update(ids=got["ids"], metadatas=[{**m, "status": status} for m in got["metadatas"]])

    def search(self, org: str, claim: str, status: str, k: int = 3) -> list[dict]:
        col = self._col(org)
        if col.count() == 0:
            return []
        r = col.query(query_embeddings=self.model.encode([claim]).tolist(), n_results=k, where={"status": status})
        return [{
            "text": d,
            "title": m["title"],
            "version": m["version"],
            "effective": m["effective"] or None,
            "review": m["review"] or None,
            "score": 1 - dist
        } for d, m, dist in zip(r["documents"][0], r["metadatas"][0], r["distances"][0])]
