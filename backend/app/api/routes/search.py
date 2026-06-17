from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.schemas import SearchRequest, SearchResponse, SearchResult
from app.core.security import get_current_user
from app.services.vector_service import vector_store
from app.services.activity_service import log_action

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
def semantic_search(
    payload: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hits = vector_store.search(payload.query, top_k=payload.top_k)
    results = []
    for meta, dist in hits:
        snippet = meta["chunk"][:300] + ("…" if len(meta["chunk"]) > 300 else "")
        # Convert L2 distance → similarity score (0–1, higher is better)
        score = round(max(0.0, 1.0 - dist / 4.0), 4)
        results.append(
            SearchResult(
                document_id=meta["doc_id"],
                title=meta["title"],
                snippet=snippet,
                score=score,
            )
        )
    log_action(db, current_user.id, "search", f"Query: '{payload.query}' → {len(results)} results")
    return SearchResponse(query=payload.query, results=results)
