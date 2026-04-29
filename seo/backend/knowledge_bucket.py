import json
import os
import uuid
from typing import List, Tuple, Dict, Optional
from pathlib import Path

import faiss
import numpy as np
import pandas as pd
import pdfplumber
from google import genai
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Import advanced response formatter
try:
    from ai_response_formatter import (
        ResponseFormatter, ContextAnalyzer, AIResponseQualityScore, 
        format_response_json
    )
except ImportError:
    ResponseFormatter = None
    ContextAnalyzer = None
    AIResponseQualityScore = None
    format_response_json = None

# Configure Gemini from env only.
_DOTENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_DOTENV_PATH, override=False)


def _load_api_key() -> str:
    raw = os.getenv("GEMINI_API_KEY") or os.getenv("SOCIAL_API_KEY") or ""
    key = raw.strip().strip('"').strip("'")
    # Valid Gemini API keys start with 'AIza'.
    # Reject OAuth tokens (e.g. 'AQ.xxx') that cause [Errno 22] on Windows.
    if key and not key.startswith("AIza"):
        import logging as _log
        _log.getLogger(__name__).warning(
            "GEMINI_API_KEY looks invalid (must start with 'AIza'). "
            "AI chat will use extractive fallbacks until a valid key is set."
        )
        return ""

    # Extra validation: ensure only safe characters (prevents odd hidden chars/newlines).
    if key:
        import re as _re
        if not _re.fullmatch(r"AIza[0-9A-Za-z_\-]{10,}", key):
            import logging as _log
            _log.getLogger(__name__).warning(
                "GEMINI_API_KEY format looks invalid. "
                "AI chat will use extractive fallbacks until a valid key is set."
            )
            return ""
    return key


def is_gemini_configured() -> bool:
    return bool(_load_api_key())


API_KEY = _load_api_key()

_embedder = None


def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def chunk_text(text: str, chunk_size: int = 450, overlap: int = 80) -> List[str]:
    words = (text or "").split()
    if not words:
        return []
    chunks = []
    step = max(1, chunk_size - overlap)
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size]).strip()
        if chunk:
            chunks.append(chunk)
    return chunks


def extract_text_from_file(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    elif ext == ".pdf":
        with pdfplumber.open(file_path) as pdf:
            pages = []
            for page in pdf.pages:
                extracted = page.extract_text() or ""
                if extracted.strip():
                    pages.append(extracted)
            text = "\n".join(pages)
    elif ext == ".csv":
        df = pd.read_csv(file_path)
        text = df.fillna("").astype(str).to_string(index=False)
    elif ext in (".xlsx", ".xls"):
        xls = pd.ExcelFile(file_path)
        parts = []
        for sheet in xls.sheet_names:
            df = xls.parse(sheet).fillna("").astype(str)
            parts.append(f"[Sheet: {sheet}]\n{df.to_string(index=False)}")
        text = "\n\n".join(parts)
    else:
        raise ValueError("Unsupported file type. Allowed: PDF, CSV, XLSX, XLS, TXT.")

    return text.strip()


def _safe_owner_id(owner_id: str) -> str:
    """Ensure the owner id is safe to use in filenames on Windows."""
    import re as _re
    return _re.sub(r"[^0-9A-Za-z_.-]", "_", (owner_id or "").strip()) or "owner"


def _index_path(owner_id: str, vector_dir: str) -> str:
    safe_id = _safe_owner_id(owner_id)
    return os.path.join(vector_dir, f"{safe_id}.index")


def _meta_path(owner_id: str, vector_dir: str) -> str:
    safe_id = _safe_owner_id(owner_id)
    return os.path.join(vector_dir, f"{safe_id}_meta.json")


def _load_index_and_meta(owner_id: str, vector_dir: str) -> Tuple[object, List[dict]]:
    idx_path = _index_path(owner_id, vector_dir)
    m_path = _meta_path(owner_id, vector_dir)
    if os.path.exists(idx_path) and os.path.exists(m_path):
        index = faiss.read_index(idx_path)
        with open(m_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        return index, meta
    return None, []


def _save_index_and_meta(owner_id: str, vector_dir: str, index, meta: List[dict]):
    os.makedirs(vector_dir, exist_ok=True)
    faiss.write_index(index, _index_path(owner_id, vector_dir))
    with open(_meta_path(owner_id, vector_dir), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False)


def process_and_store_file(file_path: str, original_filename: str, owner_id: str, vector_dir: str):
    text = extract_text_from_file(file_path)
    if not text:
        return False, "No readable text found in file."

    chunks = chunk_text(text)
    if not chunks:
        return False, "No meaningful text chunks could be extracted."

    embedder = get_embedder()
    embs = np.array(embedder.encode(chunks), dtype="float32")

    index, meta = _load_index_and_meta(owner_id, vector_dir)
    if index is None:
        index = faiss.IndexFlatL2(embs.shape[1])
    index.add(embs)

    file_id = str(uuid.uuid4())
    for chunk in chunks:
        meta.append({"file_id": file_id, "filename": original_filename, "text": chunk})
    _save_index_and_meta(owner_id, vector_dir, index, meta)
    return True, {"file_id": file_id, "filename": original_filename, "chunks_added": len(chunks)}


def get_user_files(owner_id: str, vector_dir: str):
    # compatibility helper; DB-backed listing should be preferred.
    _, meta = _load_index_and_meta(owner_id, vector_dir)
    by_id = {}
    for item in meta:
        fid = item.get("file_id")
        if fid and fid not in by_id:
            by_id[fid] = item.get("filename", "Unknown")
    return [{"file_id": k, "filename": v} for k, v in by_id.items()]


def delete_user_file(owner_id: str, file_id: str, vector_dir: str) -> bool:
    _, meta = _load_index_and_meta(owner_id, vector_dir)
    if not meta:
        return False

    remaining = [m for m in meta if m.get("file_id") != file_id]
    if len(remaining) == len(meta):
        return False

    if not remaining:
        for p in (_index_path(owner_id, vector_dir), _meta_path(owner_id, vector_dir)):
            if os.path.exists(p):
                os.remove(p)
        return True

    texts = [m.get("text", "") for m in remaining]
    emb = np.array(get_embedder().encode(texts), dtype="float32")
    new_index = faiss.IndexFlatL2(emb.shape[1])
    new_index.add(emb)
    _save_index_and_meta(owner_id, vector_dir, new_index, remaining)
    return True


def _generate_answer(query_text: str, context_chunks: List[str], system_hint: str, short_answer: bool = False) -> str:
    if not API_KEY:
        # Fallback: return extractive answer from context so feature remains usable.
        base = context_chunks[0].strip() if context_chunks else ""
        if not base:
            return "I don't have enough information in the available knowledge to answer that."
        return (base[:220] + "...") if len(base) > 220 else base
    if not context_chunks:
        return "I don't have enough information in the available knowledge to answer that."

    context_str = "\n\n---\n\n".join(context_chunks)
    brevity = "Answer in 1-2 lines only." if short_answer else "Answer clearly and accurately."
    prompt = f"""{system_hint}
Use ONLY the context provided. If answer is not present, say you don't have enough context.
{brevity}

CONTEXT:
{context_str}

QUESTION:
{query_text}
"""
    try:
        live_key = _load_api_key()
        if not live_key:
            raise ValueError("No valid GEMINI_API_KEY set")
        client = genai.Client(api_key=live_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return (response.text or "").strip()
    except Exception as _exc:
        import logging as _logging
        _logging.getLogger(__name__).warning(f"Gemini call failed ({_exc}), using extractive fallback")
        # Graceful degradation: return a snippet of the top context chunk.
        base = context_chunks[0].strip() if context_chunks else ""
        if not base:
            return "I don't have enough information in the available knowledge to answer that."
        if short_answer:
            return (base[:180] + "...") if len(base) > 180 else base
        return (base[:350] + "...") if len(base) > 350 else base


def ask_rag_query(owner_id: str, query_text: str, vector_dir: str) -> str:
    index, meta = _load_index_and_meta(owner_id, vector_dir)
    if index is None or index.ntotal == 0:
        return "You have no documents uploaded to your knowledge bucket yet."

    q_emb = np.array(get_embedder().encode([query_text]), dtype="float32")
    k = min(6, index.ntotal)
    _, idxs = index.search(q_emb, k)
    chunks = []
    for idx in idxs[0]:
        if 0 <= idx < len(meta):
            chunk = meta[idx].get("text", "").strip()
            if chunk:
                chunks.append(chunk)
    return _generate_answer(
        query_text,
        chunks,
        "You are Scalnex business knowledge assistant.",
        short_answer=False,
    )


def ask_rag_query_advanced(
    owner_id: str, 
    query_text: str, 
    vector_dir: str,
    answer_type: str = "detailed"  # "short", "long", or "detailed"
) -> Dict:
    """
    Enhanced RAG query with rich metadata, confidence scoring, and follow-up suggestions.
    
    Args:
        owner_id: User/business ID
        query_text: User question
        vector_dir: Vector database directory
        answer_type: Response length preference ("short", "long", "detailed")
    
    Returns:
        Dict with answer, sources, follow-ups, confidence, and metadata
    """
    import logging
    logger = logging.getLogger(__name__)
    
    index, meta = _load_index_and_meta(owner_id, vector_dir)
    if index is None or index.ntotal == 0:
        return format_response_json(
            "You have no documents uploaded to your knowledge bucket yet.",
            sources=[],
            confidence=0.0,
            answer_type="error"
        ) if format_response_json else {
            "answer": "You have no documents uploaded to your knowledge bucket yet.",
            "confidence": 0.0,
            "sources": [],
            "follow_up_questions": []
        }

    # Get embeddings and search
    q_emb = np.array(get_embedder().encode([query_text]), dtype="float32")
    k = min(6, index.ntotal)
    distances, idxs = index.search(q_emb, k)
    
    chunks = []
    meta_refs = []
    for idx in idxs[0]:
        if 0 <= idx < len(meta):
            chunk = meta[idx].get("text", "").strip()
            if chunk:
                chunks.append(chunk)
                meta_refs.append(meta[idx])
    
    if not chunks:
        return {
            "answer": "Sorry, I couldn't find relevant information to answer your question.",
            "confidence": 0.2,
            "sources": [],
            "follow_up_questions": ["Try uploading more relevant documents"],
            "answer_type": "no_context"
        }
    
    # Generate base answer
    short_ans = answer_type == "short"
    base_answer = _generate_answer(
        query_text,
        chunks,
        "You are Scalnex business knowledge assistant. Provide accurate, concise answers.",
        short_answer=short_ans,
    )
    
    # Calculate quality metrics if formatter is available
    confidence = 0.85
    sources = []
    follow_ups = []
    
    if ResponseFormatter and ContextAnalyzer and AIResponseQualityScore:
        try:
            # Extract sources
            sources = ResponseFormatter.extract_sources_from_meta(meta_refs)
            
            # Measure relevance
            relevance, _ = ContextAnalyzer.measure_relevance(query_text, chunks)
            context_coverage = ContextAnalyzer.calculate_context_coverage(chunks)
            
            # Calculate confidence
            confidence = AIResponseQualityScore.calculate_confidence(
                relevance,
                len(base_answer.split()),
                context_coverage
            )
            
            # Generate follow-up questions
            follow_ups = ResponseFormatter.generate_follow_up_questions(query_text, base_answer)
            
            # Format answer based on type
            if answer_type == "short":
                formatted_answer = ResponseFormatter.create_short_answer(base_answer)
            elif answer_type == "long":
                formatted_answer = ResponseFormatter.truncate_response(base_answer, 500)
            else:  # detailed
                formatted_answer = base_answer
                
        except Exception as e:
            logger.warning(f"Error in advanced processing: {e}")
            formatted_answer = base_answer
    else:
        formatted_answer = base_answer
    
    return {
        "answer": formatted_answer,
        "confidence": round(confidence, 2),
        "sources": sources,
        "follow_up_questions": follow_ups,
        "answer_type": answer_type,
        "metadata": {
            "word_count": len(formatted_answer.split()),
            "sources_count": len(sources),
            "has_follow_ups": len(follow_ups) > 0,
            "context_chunks_used": len(chunks)
        }
    }


def _ensure_project_rag(vector_dir: str, project_info_path: str):
    import logging as _log
    _logger = _log.getLogger(__name__)
    os.makedirs(vector_dir, exist_ok=True)
    project_index = os.path.join(vector_dir, "project.index")
    project_meta = os.path.join(vector_dir, "project_meta.json")

    # If both files exist, verify they can actually be loaded
    if os.path.exists(project_index) and os.path.exists(project_meta):
        try:
            test_idx = faiss.read_index(project_index)
            with open(project_meta, "r", encoding="utf-8") as f:
                test_meta = json.load(f)
            if test_idx.ntotal > 0 and test_meta:
                return  # Files exist and are valid
        except Exception as e:
            _logger.warning(f"Project RAG index corrupted, rebuilding: {e}")
            # Remove corrupted files so we can rebuild
            for p in (project_index, project_meta):
                try:
                    os.remove(p)
                except Exception:
                    pass

    # Build fresh index
    if not os.path.exists(project_info_path):
        raise FileNotFoundError(f"Project knowledge base not found: {project_info_path}")

    with open(project_info_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read().strip()
    if not text:
        raise ValueError("Project knowledge base file is empty.")

    chunks = chunk_text(text, chunk_size=280, overlap=50)
    if not chunks:
        raise ValueError("Project knowledge base has no meaningful text.")

    emb = np.array(get_embedder().encode(chunks), dtype="float32")
    index = faiss.IndexFlatL2(emb.shape[1])
    index.add(emb)
    faiss.write_index(index, project_index)
    with open(project_meta, "w", encoding="utf-8") as f:
        json.dump([{"text": c} for c in chunks], f, ensure_ascii=False)
    _logger.info(f"Project RAG index built with {len(chunks)} chunks.")


def ask_project_rag_query(query_text: str, vector_dir: str, project_info_path: str) -> str:
    _ensure_project_rag(vector_dir, project_info_path)
    project_index = os.path.join(vector_dir, "project.index")
    project_meta = os.path.join(vector_dir, "project_meta.json")

    index = faiss.read_index(project_index)
    with open(project_meta, "r", encoding="utf-8") as f:
        meta = json.load(f)

    q_emb = np.array(get_embedder().encode([query_text]), dtype="float32")
    k = min(5, index.ntotal)
    _, idxs = index.search(q_emb, k)

    chunks = []
    for idx in idxs[0]:
        if 0 <= idx < len(meta):
            chunk = meta[idx].get("text", "").strip()
            if chunk:
                chunks.append(chunk)

    return _generate_answer(
        query_text,
        chunks,
        "You are Scalnex homepage AI assistant. Answer only about Scalnex platform features.",
        short_answer=True,
    )


def ask_project_rag_query_advanced(
    query_text: str, 
    vector_dir: str, 
    project_info_path: str,
    answer_type: str = "short"
) -> Dict:
    """
    Enhanced project/homepage RAG query with rich response metadata.
    
    Args:
        query_text: User question
        vector_dir: Vector database directory
        project_info_path: Path to project info file
        answer_type: "short" or "detailed"
    
    Returns:
        Dict with answer, confidence, follow-ups, and metadata
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        _ensure_project_rag(vector_dir, project_info_path)
        project_index = os.path.join(vector_dir, "project.index")
        project_meta = os.path.join(vector_dir, "project_meta.json")

        index = faiss.read_index(project_index)
        with open(project_meta, "r", encoding="utf-8") as f:
            meta = json.load(f)

        q_emb = np.array(get_embedder().encode([query_text]), dtype="float32")
        k = min(5, index.ntotal)
        distances, idxs = index.search(q_emb, k)

        chunks = []
        for idx in idxs[0]:
            if 0 <= idx < len(meta):
                chunk = meta[idx].get("text", "").strip()
                if chunk:
                    chunks.append(chunk)

        if not chunks:
            return {
                "answer": "I don't have enough information to answer that question about our platform.",
                "confidence": 0.3,
                "follow_up_questions": ["Ask me about our features, pricing, or how to get started"],
                "answer_type": "no_context"
            }

        # Generate answer
        base_answer = _generate_answer(
            query_text,
            chunks,
            "You are Scalnex homepage AI assistant. Answer only about Scalnex platform features.",
            short_answer=True,
        )

        # Calculate metrics
        confidence = 0.85
        follow_ups = []

        if ResponseFormatter and ContextAnalyzer and AIResponseQualityScore:
            try:
                relevance, _ = ContextAnalyzer.measure_relevance(query_text, chunks)
                context_coverage = ContextAnalyzer.calculate_context_coverage(chunks)
                
                confidence = AIResponseQualityScore.calculate_confidence(
                    relevance,
                    len(base_answer.split()),
                    context_coverage
                )
                
                follow_ups = ResponseFormatter.generate_follow_up_questions(query_text, base_answer)
                
            except Exception as e:
                logger.warning(f"Error calculating metrics: {e}")

        return {
            "answer": base_answer,
            "confidence": round(confidence, 2),
            "follow_up_questions": follow_ups,
            "answer_type": answer_type or "short",
            "metadata": {
                "word_count": len(base_answer.split()),
                "chunks_used": len(chunks)
            }
        }

    except Exception as e:
        logger.error(f"Project RAG error: {e}")
        return {
            "answer": "I'm having trouble accessing the platform information. Please try again.",
            "confidence": 0.0,
            "follow_up_questions": [],
            "answer_type": "error"
        }
